import { normalizeError } from "@/shared/core/errors/normalize";

export function serializeMeta(meta?: Record<string, unknown>) {
  if (!meta) return undefined;

  const result: Record<string, unknown> = {};

  for (const key in meta) {
    const value = meta[key];

    if (value instanceof Error) {
      result[key] = normalizeError(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}
