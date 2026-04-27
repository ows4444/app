import { type RateLimitStore } from "./ports/rate-limit-store";

const WINDOW = 60_000; // 1 min

export async function rateLimit(key: string, store: RateLimitStore, opts?: { limit?: number }) {
  const now = Date.now();
  const bucket = Math.floor(now / WINDOW);
  const redisKey = `rate:${key}:${bucket}`;
  const count = await store.incr(redisKey);

  const LIMIT = opts?.limit ?? 60;

  if (count === 1) {
    await store.expire(redisKey, Math.ceil(WINDOW / 1000));
  }

  if (count > LIMIT) {
    return {
      allowed: false,
      retryAfter: Math.ceil(WINDOW / 1000),
    };
  }

  return { allowed: true };
}
