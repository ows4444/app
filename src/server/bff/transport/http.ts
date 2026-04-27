import "server-only";

import { env } from "@/config/server/env";
import { withCircuit } from "@/server/policy/circuit.policy";
import { withRetry } from "@/server/policy/retry.policy";
import { withTimeout } from "@/server/policy/timeout.policy";
import { HttpError } from "@/shared/core/errors";

const ALLOWED_HOSTS = new Set([new URL(env.AUTH_SERVICE_URL).host, new URL(env.API_SERVICE_URL).host]);

export async function httpClient<T>(
  url: string,
  init: RequestInit,
  opts: { service: string; timeout: number; idempotent?: boolean },
): Promise<T> {
  const parsed = new URL(url);

  if (!ALLOWED_HOSTS.has(parsed.host)) {
    throw new HttpError(403, "SSRF_BLOCKED");
  }

  const execute = async () => {
    const res = await fetch(url, {
      ...init,
      signal: withTimeout(opts.timeout),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new HttpError(res.status, json?.message || "UPSTREAM_ERROR");
    }

    return json;
  };

  const retryable = () => withRetry(execute, 2, { idempotent: opts.idempotent === true });
  return withCircuit(opts.service, retryable);
}
