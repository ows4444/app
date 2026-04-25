import "server-only";
import { redis } from "./client";
import { RateLimitStore } from "../security/ports/rate-limit-store";
export const runtime = "nodejs";
export const redisRateLimitStore: RateLimitStore = {
  incr: (key) => redis.incr(key),
  expire: (key, seconds) => redis.expire(key, seconds),
};
