import { apiLogger } from "@/server/observability/logger/with-context.server";
import { executeRequest } from "@/shared/api/core/execute-request";
import "server-only";

export async function apiClient<T>(path: string, options?: RequestInit) {
  return executeRequest<T>(path, options, apiLogger);
}
