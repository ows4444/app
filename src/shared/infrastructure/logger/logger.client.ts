import { serializeMeta } from "./serializer";

function log(level: string, msg: string, meta?: Record<string, unknown>) {
  const payload = {
    level,
    msg,
    ts: new Date().toISOString(),
    ...serializeMeta(meta),
  };

  const method = level === "error" ? "error" : level === "warn" ? "warn" : level === "info" ? "info" : "log";

  // eslint-disable-next-line no-console
  console[method as "log"]?.(JSON.stringify(payload));
}

export const baseLogger = {
  child: (ctx: Record<string, unknown>) => ({
    debug: (msg: string, meta?: Record<string, unknown>) => {
      log("debug", msg, { ...ctx, ...meta });
    },

    info: (msg: string, meta?: Record<string, unknown>) => {
      log("info", msg, { ...ctx, ...meta });
    },

    warn: (msg: string, meta?: Record<string, unknown>) => {
      log("warn", msg, { ...ctx, ...meta });
    },

    error: (msg: string, meta?: Record<string, unknown>) => {
      log("error", msg, { ...ctx, ...meta });
    },
  }),
};
