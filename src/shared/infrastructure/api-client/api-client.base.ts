import z from "zod";

import { apiResponseSchema } from "@/shared/api/api-response";
import { HttpError } from "@/shared/core/errors";
import { mapToDomainError } from "@/shared/core/errors/error-mapper";
import { normalizeError } from "@/shared/core/errors/normalize";
import { createAbortSignal } from "@/shared/infrastructure/abort/abort";
import { type Logger } from "@/shared/infrastructure/logger/contracts/logger";
import { shouldRetryError, shouldRetryResponse } from "@/shared/infrastructure/retry/retry-rules";

type ApiOptions = RequestInit & {
  timeout?: number;
  retry?: {
    retries?: number;
  };
  signal?: AbortSignal | null;
};

function resolveBaseUrl() {
  if (typeof window === "undefined") {
    const base = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000";

    return base.startsWith("http") ? `${base}/api` : `https://${base}/api`;
  }

  return "/api";
}

export async function executeRequest<T>(
  path: string,
  options: ApiOptions = {},
  extraHeaders?: HeadersInit,
  logger?: Logger,
): Promise<T> {
  const start = Date.now();

  const exec = async (): Promise<T> => {
    const base = resolveBaseUrl();

    const signal = createAbortSignal({
      ...(options.signal !== undefined && {
        parent: options.signal,
      }),
      timeout: options.timeout ?? 8000,
    });
    const res = await fetch(`${base}${path}`, {
      ...options,
      credentials: "include",
      signal,
      headers: {
        ...(options.headers ?? {}),
        ...(extraHeaders ?? {}),
      },
    });

    if (!res.ok) {
      logger?.error("API ERROR", {
        path,
        status: res.status,
        duration: Date.now() - start,
      });

      if (shouldRetryResponse(res.status)) {
        throw new HttpError(res.status, "RETRYABLE_HTTP_ERROR");
      }

      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        const json = await res.json().catch(() => null);
        throw new HttpError(res.status, json?.message ?? "HTTP_ERROR");
      }

      const text = await res.text();
      throw new HttpError(res.status, text || "HTTP_ERROR");
    }

    const contentType = res.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const json = await res.json();

      const parsed = apiResponseSchema(z.unknown()).safeParse(json);

      if (!parsed.success) {
        throw new HttpError(res.status, "INVALID_RESPONSE_FORMAT");
      }

      const { data, error } = parsed.data;

      if (error) {
        throw new HttpError(res.status, error);
      }

      return data as T;
    }

    const text = await res.text();

    return text as unknown as T;
  };

  const runWithRetry = async (): Promise<T> => {
    const maxRetries = options.retry?.retries ?? 0;
    let attempt = 0;

    while (true) {
      try {
        return await exec();
      } catch (err) {
        // 🔐 CSRF recovery (client-side only, single retry)
        if (err instanceof HttpError && err.status === 403 && typeof window !== "undefined" && attempt === 0) {
          try {
            await fetch("/api/csrf", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            });

            attempt++;
            continue;
          } catch {
            // ignore → fall through to retry logic
          }
        }

        const shouldRetry =
          attempt < maxRetries && (shouldRetryError(err) || (err instanceof HttpError && err.retryable));

        if (!shouldRetry) {
          throw err;
        }

        attempt++;

        const delay = Math.min(1000 * 2 ** attempt, 5000);

        await new Promise((r) => setTimeout(r, delay));
      }
    }
  };

  try {
    const result = await runWithRetry();

    if (process.env.NODE_ENV !== "production") {
      logger?.info("API success", {
        path,
        duration: Date.now() - start,
      });
    }

    return result;
  } catch (err) {
    logger?.error("API FAILURE", {
      path,
      duration: Date.now() - start,
      error: normalizeError(err),
    });

    throw mapToDomainError(err);
  }
}
