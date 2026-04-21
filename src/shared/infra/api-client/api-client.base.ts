import { z } from "zod";

import { apiResponseSchema } from "@/shared/api/api-response";
import { HttpError } from "@/shared/core/errors";
import { mapToDomainError } from "@/shared/core/errors/error-mapper";
import { normalizeError } from "@/shared/core/errors/normalize";
import { createAbortSignal } from "@/shared/infra/api-client/abort/abort";
import { shouldRetryError, shouldRetryResponse } from "@/shared/infra/api-client/retry/retry-rules";
import { type Logger } from "@/shared/infra/logger/contracts/logger";

type ApiOptions = RequestInit & {
  timeout?: number;
  signal?: AbortSignal | null;
};

function resolveBaseUrl() {
  if (typeof window !== "undefined") return "/api";

  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return base.endsWith("/api") ? base : `${base}/api`;
}

export async function executeRequest<T>(
  path: string,
  options: ApiOptions = {},
  extraHeaders?: HeadersInit,
  logger?: Logger,
): Promise<T> {
  const start = Date.now();

  const execOnce = async (): Promise<T> => {
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

    // ✅ capture rotated CSRF token
    const newCsrfToken = res.headers.get("x-csrf-token");

    if (newCsrfToken && typeof window !== "undefined") {
      const { setCsrfToken } = await import("@/shared/security/csrf.client");

      setCsrfToken(newCsrfToken);
    }

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

      const parsed = apiResponseSchema(z.any()).safeParse(json);

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

  const maxRetries = (options as ApiOptions & { retry?: { retries?: number } })?.retry?.retries ?? 2;
  let attempt = 0;

  while (true) {
    try {
      const result = await execOnce();

      if (process.env.NODE_ENV !== "production") {
        logger?.info("API success", {
          path,
          duration: Date.now() - start,
          attempt,
        });
      }

      return result;
    } catch (err) {
      const isRetryable = (err instanceof HttpError && shouldRetryResponse(err.status)) || shouldRetryError(err);

      const method = options.method?.toUpperCase() ?? "GET";

      const isSafeRetry = method === "GET" || method === "HEAD" || method === "OPTIONS";

      if (!isRetryable || !isSafeRetry || attempt >= maxRetries) {
        logger?.error("API FAILURE (final)", {
          path,
          duration: Date.now() - start,
          attempt,
          error: normalizeError(err),
        });

        throw mapToDomainError(err);
      }

      attempt++;

      const backoff = 200 * Math.pow(2, attempt); // exponential backoff

      await new Promise((r) => setTimeout(r, backoff));
    }
  }
}
