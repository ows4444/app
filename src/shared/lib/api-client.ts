import { retryWithBackoff } from "@/shared/utils/async/retry-advanced";

import { mapToDomainError } from "./error-mapper";
import { type AppError, HttpError, NetworkError, TimeoutError } from "./errors";
import { err, ok, type Result } from "./result";

type ApiOptions = RequestInit & {
  timeout?: number;
};

async function request<T>(path: string, options?: ApiOptions): Promise<T> {
  const controller = new AbortController();

  const timeout = options?.timeout ?? 8000;

  const id = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const res = await fetch(`/api${path}`, {
      ...options,
      signal: controller.signal,
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();

      throw new HttpError(res.status, text || "HTTP_ERROR");
    }

    const text = await res.text();

    const contentType = res.headers.get("content-type") ?? "";

    if (!text) return undefined as T;

    if (contentType.includes("application/json")) {
      return JSON.parse(text);
    }

    return text as T;
  } catch (err) {
    throw mapToDomainError(err);
  } finally {
    clearTimeout(id);
  }
}

export async function apiClient<T>(path: string, options?: ApiOptions): Promise<Result<T, AppError>> {
  const method = options?.method ?? "GET";

  try {
    const data = await retryWithBackoff(() => request<T>(path, options), {
      retries: 2,
      baseDelay: 300,
      maxDelay: 3000,
      jitter: true,
      shouldRetry: (err) => {
        if (method !== "GET" && method !== "HEAD") return false;

        if (err instanceof HttpError) {
          return err.status >= 500 || err.status === 429;
        }

        if (err instanceof TimeoutError) return true;

        if (err instanceof NetworkError) return true;

        return false;
      },
    });

    return ok(data);
  } catch (error) {
    return err(error as AppError);
  }
}
