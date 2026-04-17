import z from "zod";

import { apiResponseSchema } from "@/shared/api/api-response";
import { getCsrfHeaderName } from "@/shared/lib/security/csrf";

import { mapToDomainError } from "../error-mapper";
import { HttpError } from "../errors";
import { requestOrchestrator } from "./request-orchestrator";

async function resolveRequestContext() {
  if (typeof window === "undefined") {
    const mod = await import("@/shared/lib/request-context/request-context.server");
    return mod.getRequestContext();
  }

  const mod = await import("@/shared/lib/request-context/request-context.client");
  return mod.getRequestContext();
}

let csrfToken: string | null = null;

export function setCsrfToken(token: string) {
  csrfToken = token;
}

type ApiOptions = RequestInit & {
  timeout?: number;
  signal?: AbortSignal;
  dedupeTTL?: number;
  cache?: RequestCache;
  retry?: {
    retries?: number;
  };

  priority?: "high" | "low";
  tags?: string[]; // for invalidation
};

function resolveBaseUrl() {
  if (typeof window === "undefined") {
    const base = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000";

    return base.startsWith("http") ? `${base}/api` : `https://${base}/api`;
  }

  return "/api";
}

async function request<T>(path: string, options?: ApiOptions): Promise<T> {
  const ctx = await resolveRequestContext();

  const promise = requestOrchestrator(
    async (orchestratorSignal) => {
      try {
        const base = resolveBaseUrl();

        const res = await fetch(`${base}${path}`, {
          ...options,
          credentials: "include",

          signal: orchestratorSignal,
          cache: options?.cache ?? "no-store",
          headers: {
            ...(options?.headers ?? {}),
            "x-request-id": ctx.traceId,
            ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
          },
        });

        // ✅ Capture CSRF token from response header
        const csrfHeaderName = getCsrfHeaderName();
        const newToken = res.headers.get(csrfHeaderName);

        if (newToken) {
          csrfToken = newToken;
        }

        if (!res.ok) {
          const contentType = res.headers.get("content-type") ?? "";

          if (contentType.includes("application/json")) {
            const json = await res.json().catch(() => null);
            throw new HttpError(res.status, json?.message ?? "HTTP_ERROR");
          }

          const text = await res.text();
          throw new HttpError(res.status, text || "HTTP_ERROR");
        }

        const contentType = res.headers.get("content-type") ?? "";

        // ✅ define text properly
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
        return text as T;
      } finally {
        //
      }
    },
    {
      timeout: options?.timeout ?? 8000,
      ...(options?.signal ? { signal: options.signal } : {}),
    },
  );

  try {
    const data = await promise;

    return data;
  } catch (err) {
    const mapped = mapToDomainError(err);
    throw mapped;
  } finally {
    // DO NOT delete here — TTL must survive
  }
}

export async function apiClient<T>(path: string, options?: ApiOptions): Promise<T> {
  return request<T>(path, options);
}
