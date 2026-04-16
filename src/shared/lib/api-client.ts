import { HttpError, TimeoutError, NetworkError } from "./errors";
import { mapToDomainError } from "./error-mapper";
import { retryWithBackoff } from "@/shared/utils/async/retry-advanced";

type ApiOptions = RequestInit & {
  timeout?: number;
  retry?: number;
  retryDelay?: number;
};

export async function apiClient<T>(path: string, options?: ApiOptions): Promise<T> {
  const method = options?.method ?? "GET";

  return retryWithBackoff(
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
