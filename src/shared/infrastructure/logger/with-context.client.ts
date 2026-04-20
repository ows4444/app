import { baseLogger } from "./logger.client";

export function withContext(baseCtx: Record<string, unknown>) {
  return baseLogger.child(baseCtx);
}
