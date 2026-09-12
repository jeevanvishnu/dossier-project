import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../generateJwtToken/token.util";

// ─── Extend Express Request to carry decoded user ──────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string; role: string };
    }
  }
}

// ─── Protect Middleware ─────────────────────────────────────────────────────
export function protect(req: Request, res: Response, next: NextFunction): void {
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

    // 2. Verify token
    const decoded = verifyAccessToken(token) as {
      id: number;
      email: string;
      role: string;
    };

    req.user = decoded;
    console.log(`[AUTH] ✅ Authenticated user id=${decoded.id} role=${decoded.role}`);
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
