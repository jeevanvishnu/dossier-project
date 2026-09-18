import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { eq, or, lt } from "drizzle-orm";
import { db } from "../db/db";
import { users, refreshSessions } from "../db/schema";
import { signInSchema, changePasswordSchema } from "../validators/auth.validator";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../generateJwtToken/token.util";

// ─────────────────────────────────────────────────────────────────────────────
//  Cookie Configuration Helpers
// ─────────────────────────────────────────────────────────────────────────────
const COOKIE_SAME_SITE =
  (process.env.COOKIE_SAME_SITE as "strict" | "lax" | "none") ||
  (process.env.NODE_ENV === "production" ? "none" : "lax");

const COOKIE_OPTS_ACCESS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: COOKIE_SAME_SITE,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const COOKIE_OPTS_REFRESH = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: COOKIE_SAME_SITE,
  path: "/api/auth/refresh", // Scoped exclusively to refresh endpoint
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/signin
// ─────────────────────────────────────────────────────────────────────────────
export async function signIn(req: Request, res: Response): Promise<void> {
  console.log("[SIGNIN] 📥 Signin request received for:", req.body?.email);

  // 1. Validate input with Zod
  const parsed = signInSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    console.warn("[SIGNIN] ❌ Validation failed:", errors);
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  const { email, password } = parsed.data;

  try {
    // 2. Query user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      console.warn(`[SIGNIN] ⚠️ Invalid credentials for email: ${email}`);
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    // 3. Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.warn(`[SIGNIN] ⚠️ Invalid password for email: ${email}`);
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    // 4. Create new refresh token family & DB session
    const familyId = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Perform session creation inside transaction
    const { accessToken, refreshToken } = await db.transaction(async (tx) => {
      // Create initial session row
      const [newSession] = await tx
        .insert(refreshSessions)
        .values({
          userId: user.id,
          tokenHash: "temp",
          familyId,
          familyCreatedAt: now,
          expiresAt,
        })
        .returning();

      // Sign tokens
      const rt = generateRefreshToken({
        id: user.id,
        familyId,
        sessionId: newSession.id,
      });

      const at = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Update hashed token in DB
      await tx
        .update(refreshSessions)
        .set({ tokenHash: hashToken(rt) })
        .where(eq(refreshSessions.id, newSession.id));

      return { accessToken: at, refreshToken: rt };
    });

    // 5. Set httpOnly cookies
    res.cookie("accessToken", accessToken, COOKIE_OPTS_ACCESS);
    res.cookie("refreshToken", refreshToken, COOKIE_OPTS_REFRESH);

    console.log(`[SIGNIN] ✅ Signed in successfully — id=${user.id}`);

    // 6. Return response
    res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        accessToken,
      },
    });
  } catch (error: any) {
    console.error("[SIGNIN] 💥 Unexpected error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/refresh (Wrapped in DB Transaction)
// ─────────────────────────────────────────────────────────────────────────────
export async function refreshAccessToken(req: Request, res: Response): Promise<void> {
  console.log("[REFRESH] 📥 Token refresh request");

  const incomingRefreshToken: string | undefined = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    console.warn("[REFRESH] ⛔ No refresh token in cookie");
    res.status(401).json({
      success: false,
      message: "Refresh token not found.",
    });
    return;
  }

  try {
    // 1. Verify JWT signature
    const decoded = verifyRefreshToken(incomingRefreshToken) as {
      id: number;
      familyId: string;
      sessionId: number;
    };

    const incomingHash = hashToken(incomingRefreshToken);
    const now = new Date();

    // 2. Perform verification, reuse detection, and session rotation inside DB transaction
    const result = await db.transaction(async (tx) => {
      // Lookup target session
      const [session] = await tx
        .select()
        .from(refreshSessions)
        .where(eq(refreshSessions.id, decoded.sessionId))
        .limit(1);

      // ABSOLUTE SESSION CAP: If total family age > 30 days, revoke family and force re-login
      const MAX_FAMILY_AGE_MS = 30 * 24 * 60 * 60 * 1000;
      if (
        session &&
        now.getTime() - new Date(session.familyCreatedAt).getTime() > MAX_FAMILY_AGE_MS
      ) {
        console.warn(
          `[SECURITY] Forced re-login due to 30-day session age cap — revoking familyId=${session.familyId} userId=${session.userId}`
        );
        await tx
          .update(refreshSessions)
          .set({ revokedAt: now, updatedAt: now })
          .where(eq(refreshSessions.familyId, session.familyId));

        return { status: 403, errorType: "CAP_EXCEEDED" };
      }

      // REUSE DETECTION / REJECTION:
      // If session is missing OR revokedAt IS NOT NULL OR tokenHash mismatch OR familyId mismatch
      if (
        !session ||
        session.revokedAt !== null ||
        session.tokenHash !== incomingHash ||
        session.familyId !== decoded.familyId
      ) {
        const familyToRevoke = session?.familyId || decoded.familyId;
        console.warn(
          `[SECURITY] Refresh token reuse detected! Revoking familyId=${familyToRevoke} userId=${decoded.id} timestamp=${now.toISOString()}`
        );
        if (familyToRevoke) {
          await tx
            .update(refreshSessions)
            .set({ revokedAt: now, updatedAt: now })
            .where(eq(refreshSessions.familyId, familyToRevoke));
        }

        return { status: 403, errorType: "REUSE_DETECTED" };
      }

      // Check Expiration
      if (new Date(session.expiresAt).getTime() < now.getTime()) {
        await tx
          .update(refreshSessions)
          .set({ revokedAt: now, updatedAt: now })
          .where(eq(refreshSessions.id, session.id));

        return { status: 403, errorType: "EXPIRED" };
      }

      // NORMAL ROTATION PATH:
      // Mark current session as revoked at current timestamp
      await tx
        .update(refreshSessions)
        .set({ revokedAt: now, updatedAt: now })
        .where(eq(refreshSessions.id, session.id));

      // Insert new session row under the SAME familyId, carrying forward familyCreatedAt
      const newExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const [nextSession] = await tx
        .insert(refreshSessions)
        .values({
          userId: session.userId,
          tokenHash: "temp",
          familyId: session.familyId,
          familyCreatedAt: session.familyCreatedAt, // Carry forward, do NOT reset!
          expiresAt: newExpiresAt,
        })
        .returning();

      // Generate new Refresh Token carrying nextSession.id
      const newRefreshToken = generateRefreshToken({
        id: session.userId,
        familyId: session.familyId,
        sessionId: nextSession.id,
      });

      const newHash = hashToken(newRefreshToken);

      await tx
        .update(refreshSessions)
        .set({ tokenHash: newHash })
        .where(eq(refreshSessions.id, nextSession.id));

      // Query user for up-to-date role and email
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      if (!user) {
        return { status: 403, errorType: "USER_NOT_FOUND" };
      }

      const newAccessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        status: 200,
        newAccessToken,
        newRefreshToken,
        userId: user.id,
      };
    });

    if (result.status !== 200) {
      res.clearCookie("accessToken", COOKIE_OPTS_ACCESS);
      res.clearCookie("refreshToken", COOKIE_OPTS_REFRESH);

      const messages: Record<string, string> = {
        CAP_EXCEEDED: "Maximum session lifetime reached (30 days). Please sign in again.",
        REUSE_DETECTED: "Invalid or reused refresh token. Session revoked for security.",
        EXPIRED: "Refresh token expired. Please sign in again.",
        USER_NOT_FOUND: "User not found.",
      };

      res.status(403).json({
        success: false,
        message: messages[result.errorType || ""] || "Forbidden.",
      });
      return;
    }

    // Set updated cookies
    res.cookie("accessToken", result.newAccessToken!, COOKIE_OPTS_ACCESS);
    res.cookie("refreshToken", result.newRefreshToken!, COOKIE_OPTS_REFRESH);

    console.log(`[REFRESH] ✅ Tokens rotated for user id=${result.userId}`);

    // NOTE: Revoking a session family blocks future token refreshes. Existing short-lived access tokens (15m)
    // remain valid until expiry due to JWT statelessness, which is expected JWT behavior.

    res.status(200).json({
      success: true,
      message: "Access token refreshed.",
      data: { accessToken: result.newAccessToken },
    });
  } catch (error: any) {
    const isExpired = error?.name === "TokenExpiredError";
    console.warn(`[REFRESH] ⛔ ${error?.name}: ${error?.message}`);
    res.clearCookie("accessToken", COOKIE_OPTS_ACCESS);
    res.clearCookie("refreshToken", COOKIE_OPTS_REFRESH);
    res.status(403).json({
      success: false,
      message: isExpired
        ? "Refresh token expired. Please sign in again."
        : "Invalid refresh token.",
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/logout
//  Revokes only the current session family (leaving other device sessions active)
// ─────────────────────────────────────────────────────────────────────────────
export async function logout(req: Request, res: Response): Promise<void> {
  console.log("[LOGOUT] 📥 Logout request");

  const token: string | undefined = req.cookies?.refreshToken;

  if (token) {
    try {
      const decoded = verifyRefreshToken(token) as { id: number; familyId: string };
      if (decoded.familyId) {
        await db
          .update(refreshSessions)
          .set({ revokedAt: new Date(), updatedAt: new Date() })
          .where(eq(refreshSessions.familyId, decoded.familyId));
        console.log(`[LOGOUT] ✅ Refresh session family revoked for familyId=${decoded.familyId}`);
      }
    } catch {
      console.warn("[LOGOUT] ⚠️ Could not decode refresh token — clearing cookies anyway");
    }
  }

  res.clearCookie("accessToken", COOKIE_OPTS_ACCESS);
  res.clearCookie("refreshToken", COOKIE_OPTS_REFRESH);

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/change-password (Protected)
//  On password change, revokes ALL refresh sessions across ALL families for user
// ─────────────────────────────────────────────────────────────────────────────
export async function changePassword(req: Request, res: Response): Promise<void> {
  console.log(`[PASSWORD_CHANGE] 📥 Request for user id=${req.user?.id}`);

  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  const { oldPassword, newPassword } = parsed.data;
  const userId = req.user!.id;

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      console.warn(`[PASSWORD_CHANGE] ⚠️ Incorrect old password for user id=${userId}`);
      res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const now = new Date();

    await db.transaction(async (tx) => {
      // 1. Update user password
      await tx
        .update(users)
        .set({ password: hashedPassword, updatedAt: now })
        .where(eq(users.id, userId));

      // 2. Revoke ALL refresh sessions across ALL families for this user
      await tx
        .update(refreshSessions)
        .set({ revokedAt: now, updatedAt: now })
        .where(eq(refreshSessions.userId, userId));
    });

    console.log(`[SECURITY] Password changed — all refresh sessions revoked for userId=${userId}`);

    // Clear current cookies to require re-login
    res.clearCookie("accessToken", COOKIE_OPTS_ACCESS);
    res.clearCookie("refreshToken", COOKIE_OPTS_REFRESH);

    res.status(200).json({
      success: true,
      message: "Password updated successfully. All active sessions have been invalidated. Please sign in again.",
    });
  } catch (error: any) {
    console.error("[PASSWORD_CHANGE] 💥 Error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/auth/me (Protected)
// ─────────────────────────────────────────────────────────────────────────────
export async function getMe(req: Request, res: Response): Promise<void> {
  console.log(`[ME] 📥 Profile request — user id=${req.user?.id}`);

  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({ success: true, data: { user } });
  } catch (error: any) {
    console.error("[ME] 💥 Error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Database Session Cleanup Job
//  Deletes sessions where revokedAt < 30 days ago OR expiresAt < 30 days ago
// ─────────────────────────────────────────────────────────────────────────────
export async function cleanupExpiredSessions(): Promise<number> {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  try {
    const result = await db
      .delete(refreshSessions)
      .where(
        or(
          lt(refreshSessions.revokedAt, cutoff),
          lt(refreshSessions.expiresAt, cutoff)
        )
      );
    const count = result.rowCount || 0;
    if (count > 0) {
      console.log(`[CLEANUP] 🧹 Deleted ${count} expired/revoked refresh_sessions older than 30 days.`);
    }
    return count;
  } catch (err: any) {
    console.error("[CLEANUP] ❌ Cleanup job encountered an error:", err?.message);
    return 0;
  }
}
