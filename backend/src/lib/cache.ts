import { redis } from "./redis";

/**
 * Cache Key Generators
 * Centralized key generation to avoid typos and ensure consistent reads/invalidations.
 */
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  projectDossier: (projectId: string) => `project:${projectId}:dossier`,
  companyStorage: (companyId: string) => `company:${companyId}:storage`,
  adminStats: () => `admin:stats`,
};

/**
 * Generic Cache Helpers with Fail-Open Behavior
 * These helpers treat Redis as a performance layer. If a cache operation fails,
 * they log the error and allow the application to fall back to the database.
 */
export class CacheService {
  /**
   * Get an item from the cache.
   * @param key Redis key
   * @returns Parsed object or null on cache miss / error
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get<T>(key);
      return data;
    } catch (error: any) {
      console.warn(`[CACHE WARNING] Failed to GET key "${key}": ${error.message}`);
      // Fail-open: act as a cache miss
      return null;
    }
  }

  /**
   * Set an item in the cache with a TTL.
   * @param key Redis key
   * @param value Value to cache
   * @param ttlSeconds Time-to-live in seconds
   */
  static async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
    } catch (error: any) {
      console.warn(`[CACHE WARNING] Failed to SET key "${key}": ${error.message}`);
      // Fail-open: proceed without caching
    }
  }

  /**
   * Delete an item from the cache.
   * @param key Redis key
   */
  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error: any) {
      console.warn(`[CACHE WARNING] Failed to DEL key "${key}": ${error.message}`);
      // Fail-open: proceed without immediate invalidation
    }
  }
}
