import { z } from "zod";

import "server-only";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("debug"),

  APP_NAME: z.string(),

  API_SERVICE_URL: z.url(),
  AUTH_SERVICE_URL: z.url(),

  CSRF_SECRET: z.string(),
  SESSION_SECRET: z.string(),

  NEXT_PUBLIC_APP_URL: z.url(),
});

export const env = Object.freeze(schema.parse(process.env));
