import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { users } from "../db/schema";
import { verifyAccessToken } from "../generateJwtToken/token.util";

// ─── Extend Express Request to carry decoded user ──────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: string; companyId: string | null };
    }
  }
}

// ─── Protect Middleware ─────────────────────────────────────────────────────
export async function protect(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Read token from httpOnly cookie (preferred) OR Authorization header
    const tokenFromCookie  = req.cookies?.accessToken as string | undefined;
    const authHeader       = req.headers.authorization;
    const tokenFromHeader  = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;

    const token = tokenFromCookie ?? tokenFromHeader;

    if (!token) {
      console.warn("[AUTH] ⛔ No access token provided");
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
      return;
    }

    // 2. Verify token signature & expiry
    const decoded = verifyAccessToken(token) as {
      id: string;
      email: string;
      role: string;
      companyId?: string | null;
    };

    // 3. Query user from database to ensure user is active and not blocked
    const [user] = await db
      .select({ id: users.id, email: users.email, role: users.role, isBlocked: users.isBlocked })
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (!user || user.isBlocked) {
      console.warn(`[AUTH] 🚫 Access denied — user id=${decoded.id} is suspended/blocked.`);
      res.status(401).json({
        success: false,
        message: "Your account has been suspended or blocked. Please contact an administrator.",
      });
      return;
    }

    req.user = { id: user.id, email: user.email, role: user.role, companyId: decoded.companyId ?? null };
    if (process.env.NODE_ENV !== "production") {
      console.log(`[AUTH] ✅ Authenticated user id=${user.id} role=${user.role}`);
    }
    next();
  } catch (error: any) {
    const isExpired = error?.name === "TokenExpiredError";
    console.warn(`[AUTH] ⛔ Invalid token — ${error?.name}: ${error?.message}`);

    res.status(401).json({
      success: false,
      message: isExpired
        ? "Session expired. Please refresh your token."
        : "Invalid or tampered token.",
    });
  }
}

// ─── Role Guard ─────────────────────────────────────────────────────────────
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.warn(
        `[AUTH] 🚫 Forbidden — user role "${req.user?.role}" not in [${roles.join(", ")}]`
      );
      res.status(403).json({
        success: false,
        message: "Forbidden. You do not have permission to access this resource.",
      });
      return;
    }
    next();
  };
}
