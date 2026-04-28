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

function redact(meta: Record<string, unknown>) {
  const clone = { ...meta };

  if ("headers" in clone) {
    const headers = clone.headers as Record<string, unknown>;
    if (headers.authorization) headers.authorization = "[REDACTED]";

    if (headers.cookie) headers.cookie = "[REDACTED]";
  }

  return clone;
}

function withContext(baseCtx: Record<string, unknown>) {
  return {
    debug: (msg: string, meta?: Record<string, unknown>) => {
      baseLogger.debug(msg, { ...buildTraceFields(), ...redact(serializeMeta(meta) ?? {}) });
    },
    info: (msg: string, meta?: Record<string, unknown>) => {
      baseLogger.info(msg, { ...baseCtx, ...buildTraceFields(), ...redact(serializeMeta(meta) ?? {}) });
    },
    warn: (msg: string, meta?: Record<string, unknown>) => {
      baseLogger.warn(msg, { ...baseCtx, ...buildTraceFields(), ...redact(serializeMeta(meta) ?? {}) });
    },
    error: (msg: string, meta?: Record<string, unknown>) => {
      baseLogger.error(msg, { ...baseCtx, ...buildTraceFields(), ...redact(serializeMeta(meta) ?? {}) });
    },
  };
}

export const apiLogger = withContext({ scope: "api" });
export const appLogger = withContext({ scope: "app" });
export const routeLogger = withContext({ scope: "route" });
