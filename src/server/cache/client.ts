import "server-only";
import { Redis } from "@upstash/redis";

import { env } from "@/config/server/env";

export const runtime = "nodejs";
export const redis = new Redis({
  url: env.UPSTASH_REDIS_URL,
  token: env.UPSTASH_REDIS_TOKEN,
});
