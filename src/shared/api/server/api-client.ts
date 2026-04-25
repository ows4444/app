import { executeRequest } from "@/server/infra/api-client/api-client.base";
import { apiLogger } from "@/server/observability/logger/with-context.server";
import "server-only";
export async function apiClient<T>(path: string, options?: RequestInit) {
  return executeRequest<T>(path, options, apiLogger);
}
