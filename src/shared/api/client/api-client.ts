import { executeRequest } from "@/server/infra/api-client/api-client.base";
import { apiLogger } from "@/server/observability/logger/with-context.client";
import { getClientRequestContext } from "@/shared/request/request-context.client";
import { getCsrfToken } from "@/shared/security/csrf.client";
export async function apiClient<T>(path: string, options?: RequestInit & { cache?: RequestCache }) {
  const ctx = getClientRequestContext();
  const csrfToken = getCsrfToken();
  const headers: HeadersInit = {
    ...(options?.headers ?? {}),
    ...(ctx ? { "x-request-id": ctx.traceId } : {}),
    ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
  };
  return executeRequest<T>(`/api${path}`, options, apiLogger, undefined, headers);
}
