type NormalizedError = {
  message: string;
  name?: string;
  stack?: string;
  status?: number;
  cause?: unknown;

  code?: string;
  meta?: Record<string, unknown>;
};

type ErrorWithMeta = Error & {
  status?: number;
  code?: string;
  meta?: Record<string, unknown>;
};

export function normalizeError(err: unknown): NormalizedError {
  if (err instanceof Error) {
    const e = err as ErrorWithMeta;

    return {
      message: err.message,
      name: err.name,
      stack: err.stack,

      cause: err.cause,

      ...(e.status !== undefined && { status: e.status }),
      ...(e.code !== undefined && { code: e.code }),
      ...(e.meta !== undefined && { meta: e.meta }),
    };
  }

  if (typeof err === "object" && err !== null) {
    try {
      return {
        message: JSON.stringify(err),
      };
    } catch {
      return {
        message: "[Unserializable error object]",
      };
    }
  }

  return {
    message: String(err),
  };
}
