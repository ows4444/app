import "server-only";
import { getRedis } from "./client";
import { type RateLimitStore } from "../security/ports/rate-limit-store";

export const runtime = "nodejs";
export const redisRateLimitStore: RateLimitStore = {
  incr: (key) => getRedis().incr(key),
  expire: (key, seconds) => getRedis().expire(key, seconds),
};
