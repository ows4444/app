import { logger } from "./logger";

export function withContext(baseCtx: Record<string, unknown>) {
  return {
    debug: (msg: string, ctx?: Record<string, unknown>) => logger.debug(msg, { ...baseCtx, ...ctx }),
    info: (msg: string, ctx?: Record<string, unknown>) => logger.info(msg, { ...baseCtx, ...ctx }),
    warn: (msg: string, ctx?: Record<string, unknown>) => logger.warn(msg, { ...baseCtx, ...ctx }),
    error: (msg: string, ctx?: Record<string, unknown>) => logger.error(msg, { ...baseCtx, ...ctx }),
  };
}
