import "server-only";
import { serializeMeta } from "@/shared/observability/logger/serializer";
import { getTraceId } from "@/shared/request/request-context.server";

import { baseLogger } from "./logger.server";

function buildTraceFields() {
  const traceId = getTraceId();
  if (!traceId) return {};

  const hex = traceId.replace(/-/g, "").padEnd(32, "0").slice(0, 32);

  return {
    traceId,
    traceparent: `00-${hex}-0000000000000000-01`,
  };
}

function withContext(baseCtx: Record<string, unknown>) {
  const logger = baseLogger.child(baseCtx);
  return {
    debug: (msg: string, meta?: Record<string, unknown>) => {
      logger.debug({ ...buildTraceFields(), ...serializeMeta(meta) }, msg);
    },
    info: (msg: string, meta?: Record<string, unknown>) => {
      logger.info({ ...buildTraceFields(), traceparent: getTraceId(), ...serializeMeta(meta) }, msg);
    },
    warn: (msg: string, meta?: Record<string, unknown>) => {
      logger.warn({ ...buildTraceFields(), ...serializeMeta(meta) }, msg);
    },
    error: (msg: string, meta?: Record<string, unknown>) => {
      logger.error({ ...buildTraceFields(), ...serializeMeta(meta) }, msg);
    },
  };
}

export const apiLogger = withContext({ scope: "api" });
export const appLogger = withContext({ scope: "app" });
export const routeLogger = withContext({ scope: "route" });
