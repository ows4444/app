import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("debug"),
    APP_NAME: z.string(),
    API_SERVICE_URL: z.url(),
    AUTH_SERVICE_URL: z.url(),
    CSRF_SECRET: z.string(),
    SESSION_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    LOG_LEVEL: process.env.LOG_LEVEL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    APP_NAME: process.env.APP_NAME,
    API_SERVICE_URL: process.env.API_SERVICE_URL,
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
    CSRF_SECRET: process.env.CSRF_SECRET,
  },
  skipValidation: false,
});
