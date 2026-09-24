import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client from environment variables
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set
export const redis = Redis.fromEnv();
