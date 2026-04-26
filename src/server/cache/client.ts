import "server-only";

import Redis from "ioredis";

import { env } from "@/config/server/env";

import { appLogger } from "../observability/logger/with-context.server";

export const runtime = "nodejs";

let _redis: Redis | null = null;

export function getRedis() {
  if (!_redis) {
    _redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 5) return null;

        return Math.min(times * 100, 2000);
      },
    });

    _redis.on("error", (err) => {
      appLogger.error("REDIS_ERROR", { error: err });
    });

    _redis.on("connect", () => {
      appLogger.info("REDIS_CONNECTED");
    });

    _redis.on("reconnecting", () => {
      appLogger.warn("REDIS_RECONNECTING");
    });
  }

  return _redis;
}
