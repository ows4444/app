import "server-only";

import { env } from "@/config/server/env";
import { circuitRegistry } from "@/server/policy/circuit-breaker.registry";
import { withRetry } from "@/server/policy/retry.policy";
import { withTimeout } from "@/server/policy/timeout.policy";
import { CacheTags } from "@/shared/cache/tags";
import { HttpError } from "@/shared/core/errors";
import { getTraceId } from "@/shared/request/request-context.server";

const ALLOWED_HOSTS = new Set([new URL(env.AUTH_SERVICE_URL).host, new URL(env.API_SERVICE_URL).host]);

export async function httpClient<T>(
  url: string,
  init: RequestInit,
  opts: { service: string; timeout: number; idempotent?: boolean },
): Promise<{ data: T; response: Response }> {
  const parsed = new URL(url);

  if (!ALLOWED_HOSTS.has(parsed.host)) {
    throw new HttpError(403, "SSRF_BLOCKED");
  }

  const traceId = getTraceId();

  const execute = async () => {
    const res = await fetch(url, {
      ...init,
      signal: withTimeout(opts.timeout),
      credentials: "include",
      headers: {
        ...(init.headers ?? {}),
        ...(traceId
          ? {
              "x-request-id": traceId,
              traceparent: `00-${traceId.replace(/-/g, "").padEnd(32, "0").slice(0, 32)}-0000000000000000-01`,
            }
          : {}),
      },
      ...(init.cache !== undefined ? { cache: init.cache } : {}),
      ...(init.next !== undefined || opts.service
        ? {
            next: {
              ...(init.next ?? {}),
              tags: [...(init.next?.tags ?? []), CacheTags.service(String(opts.service).toLowerCase())],
            },
          }
        : {}),
    });

    let json: T | null = null;

    try {
      json = (await res.json()) as T;
    } catch {
      json = null;
    }

    if (!res.ok) {
      if (res.status === 504) {
        throw new HttpError(504, "UPSTREAM_TIMEOUT");
      }

      if (res.status >= 500) {
        throw new HttpError(res.status, extractErrorMessage(json), {
          upstream: true,
          service: opts.service,
        });
      }

      throw new HttpError(res.status, extractErrorMessage(json), {
        upstream: true,
        service: opts.service,
      });
    }

    return {
      data: json as T,
      response: res,
    };
  };

  const breaker = circuitRegistry[opts.service as keyof typeof circuitRegistry];
  const wrapped = () => breaker.execute(execute);
  return withRetry(wrapped, 2, { idempotent: opts.idempotent === true });
}

function extractErrorMessage(json: unknown): string {
  if (
    typeof json === "object" &&
    json !== null &&
    "message" in json &&
    typeof (json as Record<string, unknown>).message === "string"
  ) {
    return String((json as Record<string, unknown>).message);
  }

  return "UPSTREAM_ERROR";
}
