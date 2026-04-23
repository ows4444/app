import pino from "pino";

import { env } from "@/config/server/env";

const isProd = env.NODE_ENV === "production";

export const baseLogger = pino({
  level: env.LOG_LEVEL ?? (isProd ? "info" : "debug"),

  base: {
    env: env.NODE_ENV,
    service: "web-app",
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "headers.authorization", "headers.cookie"],
    censor: "[REDACTED]",
  },

  formatters: {
    level(label) {
      return { level: label };
    },
  },

  serializers: {
    err: pino.stdSerializers.err,
  },
});
