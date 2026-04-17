import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

export const baseLogger = pino({
  level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),

  base: {
    env: process.env.NODE_ENV,
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    censor: "[REDACTED]",
  },

  formatters: {
    level(label) {
      return { level: label };
    },
  },

  ...(isProd
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }),
});
