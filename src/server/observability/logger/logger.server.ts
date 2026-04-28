import winston from "winston";

import { env } from "@/config/server/env";
import "server-only";

const isProd = env.NODE_ENV === "production";

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""}`;
  }),
);

export const baseLogger = winston.createLogger({
  level: env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
  format: isProd ? jsonFormat : devFormat,
  defaultMeta: {
    env: env.NODE_ENV,
    service: "web-app",
  },
  transports: [new winston.transports.Console()],
});
