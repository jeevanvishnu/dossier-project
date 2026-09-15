import { Request, Response, NextFunction } from "express";

/**
 * CSRF Protection Middleware via Origin / Sec-Fetch-Site checking
 * Ensures cross-site requests to cookie-authenticated auth endpoints
 * originate from the configured allowed frontend domain.
 */
export function csrfCheck(req: Request, res: Response, next: NextFunction): void {
  // Only check state-changing methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const secFetchSite = req.headers["sec-fetch-site"];
  if (secFetchSite && secFetchSite === "cross-site") {
    const origin = req.headers.origin || req.headers.referer;
    const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

    if (origin && !origin.startsWith(allowedOrigin)) {
      console.warn(`[CSRF] ⛔ Cross-site request rejected. Origin: ${origin}, Expected: ${allowedOrigin}`);
      res.status(403).json({
        success: false,
        message: "Forbidden: CSRF check failed.",
      });
      return;
    }
  }

  next();
}
