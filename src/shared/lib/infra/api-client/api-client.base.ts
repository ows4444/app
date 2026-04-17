import z from "zod";

import { apiResponseSchema } from "@/shared/api/api-response";
import { mapToDomainError } from "@/shared/lib/error-mapper";
import { HttpError } from "@/shared/lib/errors";
import { normalizeError } from "@/shared/lib/errors/normalize";
import { type Logger } from "@/shared/lib/infra/logger/contracts/logger";
import { shouldRetryError, shouldRetryResponse } from "@/shared/lib/infra/retry/retry-rules";

type ApiOptions = RequestInit & {
  timeout?: number;
  retry?: {
    retries?: number;
  };
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
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, options.timeout ?? 8000);

  const signal = options.signal ?? controller.signal;

  const exec = async (): Promise<T> => {
    const base = resolveBaseUrl();

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
  } finally {
    clearTimeout(timeout);
  }
}
