type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

type LogEntry = {
  level: LogLevel;
  message: string;
  ts: string;
  traceId?: string;
  userId?: string;
  locale?: string;
} & LogContext;

const isProd = process.env.NODE_ENV === "production";

const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";

const levels = ["debug", "info", "warn", "error"];

function shouldLog(level: LogLevel) {
  return levels.indexOf(level) >= levels.indexOf(LOG_LEVEL as LogLevel);
}

function serialize(entry: LogEntry) {
  return JSON.stringify(entry);
}

function baseLog(level: LogLevel, message: string, context?: LogContext) {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    ts: new Date().toISOString(),
    ...context,
  };

  const output = serialize(entry);

  if (level === "error") console.error(output);
  else if (level === "warn") console.warn(output);
  // eslint-disable-next-line no-console
  else console.log(output);
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => {
    if (!isProd) baseLog("debug", msg, ctx);
  },

  info: (msg: string, ctx?: LogContext) => {
    baseLog("info", msg, ctx);
  },

  warn: (msg: string, ctx?: LogContext) => {
    baseLog("warn", msg, ctx);
  },

  error: (msg: string, ctx?: LogContext) => {
    baseLog("error", msg, ctx);
  },
};
