import { withContext } from "@/shared/lib/infra/logger/with-context.client";
import { getClientRequestContext } from "@/shared/lib/request-context/request-context.client";
import { getCsrfHeaderName } from "@/shared/lib/security/csrf.client";

import { executeRequest } from "./api-client.base";

export async function apiClient<T>(
  path: string,
  options?: RequestInit & { retry?: { retries?: number }; cache?: RequestCache },
) {
  const ctx = getClientRequestContext();
  const log = withContext({ scope: "api-client" });

  const headers: HeadersInit = {
    ...(options?.headers ?? {}),
    ...(ctx ? { "x-request-id": ctx.traceId } : {}),
  };

  // CSRF
  const match = document.cookie.match(/(^| )csrf_token=([^;]+)/);
  const token = match?.[2];

  if (token) {
    headers[getCsrfHeaderName()] = token;
  }

  return executeRequest<T>(path, options, headers, log);
}
