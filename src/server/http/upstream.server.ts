import "server-only";
import { headers } from "next/headers";

import { env } from "@/config/server/env";
import { HttpError } from "@/shared/core/errors";
import { mapToDomainError } from "@/shared/core/errors/error-mapper";
import { normalizeError } from "@/shared/core/errors/normalize";

import { apiLogger } from "../observability/logger/with-context.server";
import { withCircuitBreaker } from "../resilience/circuit-breaker";

type ServiceName = "AUTH" | "API";

function resolveServiceUrl(service: ServiceName) {
  switch (service) {
    case "AUTH":
      return env.AUTH_SERVICE_URL;
    case "API":
      return env.API_SERVICE_URL;
  }
}

function extractSetCookies(headers: Headers): string[] {
  const anyHeaders = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof anyHeaders.getSetCookie === "function") {
    return anyHeaders.getSetCookie();
  }

  const cookies: string[] = [];

  headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      cookies.push(value);
    }
  });

  return cookies;
}

async function fetchWithRetry(url: string, init: RequestInit, retries = 2): Promise<Response> {
  let attempt = 0;

  while (true) {
    try {
      return await fetch(url, init);
    } catch (err) {
      const isIdempotent = ["GET", "HEAD"].includes(init.method ?? "GET");

      if (attempt >= retries || !isIdempotent) {
        throw err;
      }

      const delay = 100 * Math.pow(2, attempt);

      await new Promise((r) => setTimeout(r, delay));
      attempt++;
    }
  }
}

export async function serviceClient<T>(
  service: ServiceName,
  path: string,
  options: RequestInit & { tags?: string[] } = {},
): Promise<{ data: T; cookies: string[]; status: number; statusText: string }> {
  const start = Date.now();

  try {
    const headerStore = await headers();
    const cookie = headerStore.get("cookie");
    const csrf = headerStore.get("x-csrf-token");
    const traceId = headerStore.get("x-request-id");
    const traceparent = traceId
      ? `00-${traceId.replace(/-/g, "").padEnd(32, "0").slice(0, 32)}-0000000000000000-01`
      : undefined;
    const locale = headerStore.get("accept-language");
    const timeoutMs = 5000;
    const signal = AbortSignal.timeout(timeoutMs);

    const res = await withCircuitBreaker(service, () =>
      fetchWithRetry(`${resolveServiceUrl(service)}${path}`, {
        ...options,
        cache: options.tags ? "force-cache" : "no-store",
        next: options.tags ? { tags: options.tags } : undefined,
        headers: {
          ...(options.headers ?? {}),
          ...(traceId ? { "x-request-id": traceId } : {}),
          ...(traceId ? { "x-trace-id": traceId } : {}),
          ...(traceparent ? { traceparent } : {}),
          ...(csrf ? { "x-csrf-token": csrf } : {}),
          ...(cookie ? { cookie } : {}),
          ...(locale ? { "accept-language": locale } : {}),
        },
        signal,
      }),
    );

    const contentType = res.headers.get("content-type") ?? "";

    if (!res.ok) {
      apiLogger.error("SERVICE_ERROR", {
        service,
        path,
        status: res.status,
        duration: Date.now() - start,
      });

      if (contentType.includes("application/json")) {
        const json = await res.json().catch(() => null);
        throw new HttpError(res.status, json?.message ?? "SERVICE_ERROR");
      }

      const text = await res.text();
      throw new HttpError(res.status, text || "SERVICE_ERROR");
    }

    let data: unknown;

    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return {
      data: data as T,
      cookies: extractSetCookies(res.headers),
      status: res.status,
      statusText: res.statusText,
    };
  } catch (err) {
    apiLogger.error("SERVICE_FAILURE", {
      service,
      path,
      duration: Date.now() - start,
      error: normalizeError(err),
    });

    throw mapToDomainError(err);
  }
}
