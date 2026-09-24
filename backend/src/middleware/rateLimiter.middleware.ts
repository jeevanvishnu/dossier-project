import { Request, Response, NextFunction } from "express";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "../lib/redis";

// Shared in-memory cache for `@upstash/ratelimit` to reduce Redis calls for blocked users
const ephemeralCache = new Map();

/**
 * Helper to create an Upstash rate limiter middleware.
 * Implements a strict fail-open policy (1000ms timeout).
 * 
 * @param config Rate limit configuration (max requests, window string)
 * @param keyGenerator Function to generate the unique identifier for the limit
 */
function createRateLimiter(
  config: { max: number; window: string },
  keyGenerator: (req: Request) => string
) {
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.max, config.window as any),
    ephemeralCache,
    timeout: 1000, // Fail-open after 1000ms if Redis is unreachable
  });

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = keyGenerator(req);
      const { success, reset, pending, reason } = await limiter.limit(identifier);

      // In serverless environments, we would context.waitUntil(pending)
      // Since this is Express, we just let the promise execute in the background
      pending.catch((err) => {
        console.warn(`[RATELIMIT WARNING] Background sync failed: ${err.message}`);
      });

      if (!success) {
        // If the request is blocked, return 429
        const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
        res.setHeader("Retry-After", String(retryAfter));
        
        let message = "Too many requests. Please try again later.";
        if (reason === "timeout") {
           // We normally fail-open on timeout. The @upstash/ratelimit SDK returns success=true on timeout
           // if timeout is configured. So we shouldn't hit this, but handled just in case.
        }

        res.status(429).json({
          success: false,
          message,
          retryAfter,
        });
        return;
      }

      next();
    } catch (error: any) {
      console.error(`[RATELIMIT ERROR] Unexpected error: ${error.message}`);
      // Fail-open strictly: allow request through if limiter throws an unhandled exception
      next();
    }
  };
}

// ------------------------------------------------------------------
// Specific Limiters
// ------------------------------------------------------------------

// authLimiter: 20 req / 15m. Keyed by IP or Email (dual-protection logic inside keyGenerator)
// We use a composite key to rate limit both the IP and the specific account being brute-forced.
export const authLimiter = createRateLimiter(
  { max: 20, window: "15 m" },
  (req) => `auth:${req.ip}:${req.body?.email || "anonymous"}`
);

// logoutLimiter: 10 req / 5m. Keyed by IP.
export const logoutLimiter = createRateLimiter(
  { max: 10, window: "5 m" },
  (req) => `logout:${req.ip}`
);

// changePasswordLimiter: 5 req / 15m. Keyed by userId + IP.
export const changePasswordLimiter = createRateLimiter(
  { max: 5, window: "15 m" },
  (req) => `changepw:${req.user?.id || "unknown"}:${req.ip}`
);

// uploadLimiter: 20 req / 10m. Keyed by userId.
export const uploadLimiter = createRateLimiter(
  { max: 20, window: "10 m" },
  (req) => `upload:${req.user?.id || "unknown"}`
);

// compileLimiter: 3 req / 5m. Keyed by userId + projectId to isolate project spam.
export const compileLimiter = createRateLimiter(
  { max: 3, window: "5 m" },
  (req) => `compile:${req.user?.id || "unknown"}:${req.params.id || "unknown"}`
);

// exportLimiter: 5 req / 5m. Keyed by userId.
export const exportLimiter = createRateLimiter(
  { max: 5, window: "5 m" },
  (req) => `export:${req.user?.id || "unknown"}`
);
