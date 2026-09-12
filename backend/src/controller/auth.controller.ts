import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { users } from "../db/schema";
import { signInSchema } from "../validators/auth.validator";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../generateJwtToken/token.util";

// ─────────────────────────────────────────────────────────────────────────────
//  Cookie helpers
// ─────────────────────────────────────────────────────────────────────────────
const COOKIE_OPTS_ACCESS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge:   15 * 60 * 1000,          // 15 minutes
};

const COOKIE_OPTS_REFRESH = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path:     "/api/auth/refresh",     // scope refresh cookie to refresh endpoint only
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/signin
// ─────────────────────────────────────────────────────────────────────────────
export async function signIn(req: Request, res: Response): Promise<void> {
  console.log("[SIGNIN] 📥 Request received:", req.body?.email);

  // 1. Validate
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
    // 2. Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // 3. Generic error to avoid user enumeration
    if (!user) {
      console.warn(`[SIGNIN] ⚠️  No user found for email: ${email}`);
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    // 4. Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.warn(`[SIGNIN] ⚠️  Wrong password for email: ${email}`);
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    // 5. Issue tokens
    const accessToken  = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    // 6. Persist latest refresh token (old one is rotated out)
    await db
      .update(users)
      .set({ refreshToken, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // 7. Set cookies
    res.cookie("accessToken",  accessToken,  COOKIE_OPTS_ACCESS);
    res.cookie("refreshToken", refreshToken, COOKIE_OPTS_REFRESH);

    console.log(`[SIGNIN] ✅ Signed in — id=${user.id} email=${user.email}`);

    res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      data: {
        user: {
          id:        user.id,
          name:      user.name,
          email:     user.email,
          role:      user.role,
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
//  POST /api/auth/refresh
//  Issues a new access token using a valid refresh token (rotation strategy)
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
    // 1. Verify signature
    const decoded = verifyRefreshToken(incomingRefreshToken) as { id: number };

    // 2. Lookup user and compare stored token (prevents token reuse after logout)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (!user || user.refreshToken !== incomingRefreshToken) {
      console.warn(`[REFRESH] 🚫 Token mismatch or user not found — id=${decoded.id}`);
      res.status(403).json({
        success: false,
        message: "Invalid or reused refresh token. Please sign in again.",
      });
      return;
    }

    // 3. Rotate — issue brand new pair
    const newAccessToken  = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    // 4. Persist new refresh token
    await db
      .update(users)
      .set({ refreshToken: newRefreshToken, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    // 5. Rotate cookies
    res.cookie("accessToken",  newAccessToken,  COOKIE_OPTS_ACCESS);
    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTS_REFRESH);

    console.log(`[REFRESH] ✅ Tokens rotated for user id=${user.id}`);

    res.status(200).json({
      success: true,
      message: "Access token refreshed.",
      data: { accessToken: newAccessToken },
    });
  } catch (error: any) {
    const isExpired = error?.name === "TokenExpiredError";
    console.warn(`[REFRESH] ⛔ ${error?.name}: ${error?.message}`);
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
// ─────────────────────────────────────────────────────────────────────────────
export async function logout(req: Request, res: Response): Promise<void> {
  console.log("[LOGOUT] 📥 Logout request");

  const token: string | undefined = req.cookies?.refreshToken;

  if (token) {
    try {
      const decoded = verifyRefreshToken(token) as { id: number };
      // Invalidate stored refresh token
      await db
        .update(users)
        .set({ refreshToken: null, updatedAt: new Date() })
        .where(eq(users.id, decoded.id));
      console.log(`[LOGOUT] ✅ Refresh token cleared for user id=${decoded.id}`);
    } catch {
      // Token invalid/expired — still clear cookies
      console.warn("[LOGOUT] ⚠️  Could not decode refresh token — clearing cookies anyway");
    }
  }

  res.clearCookie("accessToken",  { httpOnly: true, sameSite: "strict" });
  res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict", path: "/api/auth/refresh" });

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/auth/me   (protected)
// ─────────────────────────────────────────────────────────────────────────────
export async function getMe(req: Request, res: Response): Promise<void> {
  console.log(`[ME] 📥 Profile request — user id=${req.user?.id}`);

  try {
    const [user] = await db
      .select({
        id:        users.id,
        name:      users.name,
        email:     users.email,
        role:      users.role,
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
