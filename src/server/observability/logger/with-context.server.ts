import { getTraceId } from "@/shared/request/request-context.server";
import "server-only";
import { baseLogger } from "./logger.server";
import { serializeMeta } from "./serializer";
function withContext(baseCtx: Record<string, unknown>) {
  const logger = baseLogger.child(baseCtx);
  return {
    debug: (msg: string, meta?: Record<string, unknown>) => {
      logger.debug({ traceId: getTraceId(), ...serializeMeta(meta) }, msg);
    },
    info: (msg: string, meta?: Record<string, unknown>) => {
      logger.info({ traceId: getTraceId(), ...serializeMeta(meta) }, msg);
    },
    warn: (msg: string, meta?: Record<string, unknown>) => {
      logger.warn({ traceId: getTraceId(), ...serializeMeta(meta) }, msg);
    },
    error: (msg: string, meta?: Record<string, unknown>) => {
      logger.error({ traceId: getTraceId(), ...serializeMeta(meta) }, msg);
    },
  };
}
export const apiLogger = withContext({ scope: "api" });
export const appLogger = withContext({ scope: "app" });
export const routeLogger = withContext({ scope: "route" });
