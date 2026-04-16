import { retryWithBackoff } from "@/shared/utils/async/retry-advanced";
import { mapToDomainError } from "./error-mapper";
import { AppError, HttpError, NetworkError, TimeoutError } from "./errors";

import { err, ok, Result } from "./result";

type ApiOptions = RequestInit & {
  timeout?: number;
  retry?: number;
  retryDelay?: number;
};
export async function apiClient<T>(path: string, options?: ApiOptions): Promise<Result<T, AppError>> {
  const method = options?.method ?? "GET";

  return retryWithBackoff<Result<T, AppError>>(
    async () => {
      const controller = new AbortController();
      const timeout = options?.timeout ?? 8000;

      const id = setTimeout(() => controller.abort(), timeout);

      try {
        const res = await fetch(`/api${path}`, {
          ...options,
          signal: controller.signal,
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          return err(new HttpError(res.status, text || "HTTP_ERROR"));
        }

        const text = await res.text();
        const contentType = res.headers.get("content-type") ?? "";

        if (!text) return ok(undefined as T);
        if (contentType.includes("application/json")) {
          return ok(JSON.parse(text));
        }

        return ok(text as T);
      } catch (error) {
        return err(mapToDomainError(error));
      } finally {
        clearTimeout(id);
      }
    },
    {
      retries: 2,
      baseDelay: 300,
      maxDelay: 3000,
      jitter: true,

      shouldRetry: (err) => {
        if (method !== "GET" && method !== "HEAD") return false;

        if (err instanceof HttpError) {
          return err.status >= 500;
        }

        if (err instanceof TimeoutError) return true;
        if (err instanceof NetworkError) return true;

        return false;
      },
    },
  );
}
