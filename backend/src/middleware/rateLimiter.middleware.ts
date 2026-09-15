import { Request, Response, NextFunction } from "express";

/**
 * Single-Instance In-Memory Sliding Window Rate Limiter
 * 
 * NOTE / KNOWN LIMITATION:
 * This rate limiter stores hit counts in a local Node.js process Map.
 * It will NOT share state across multiple scaled instances or serverless invocations.
 * For multi-instance production clusters, replace this store with Redis (e.g. ioredis / rate-limit-redis).
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const stores = new Map<string, Map<string, RateLimitStore>>();

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  name?: string;
}) {
  const { windowMs, max, message = "Too many requests, please try again later.", name = "default" } = options;

  if (!stores.has(name)) {
    stores.set(name, new Map());
  }

  const store = stores.get(name)!;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    const now = Date.now();

    const record = store.get(ip);

    if (!record || now > record.resetTime) {
      store.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      console.warn(`[RATE_LIMIT] ⚠️  Rate limit exceeded for IP=${ip} on route limiter="${name}"`);
      res.status(429).json({
        success: false,
        message,
        retryAfterSeconds,
      });
      return;
    }

    record.count += 1;
    next();
  };
}
