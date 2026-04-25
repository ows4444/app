import "server-only";
import { Redis } from "ioredis";

import { env } from "@/config/server/env";

export const runtime = "nodejs";
export const redis = new Redis(env.UPSTASH_REDIS_URL);
