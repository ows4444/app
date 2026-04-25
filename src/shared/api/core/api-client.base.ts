import { Logger } from "@/server/observability/logger/contracts/logger";
import { syncCsrfToken } from "@/shared/api/core/csrf";
import { performFetch } from "@/shared/api/core/fetch";
import { handleResponse } from "@/shared/api/core/response";
import { type z } from "zod";
type ApiOptions = RequestInit & {
  timeout?: number;
  signal?: AbortSignal | null;
};
export async function executeRequest<T>(
  path: string,
  options: ApiOptions = {},
  logger: Logger,
  schema?: z.ZodType<T>,
  extraHeaders?: HeadersInit,
): Promise<T> {
  const start = Date.now();
  const res = await performFetch(path, options, extraHeaders);
  syncCsrfToken(res);
  return handleResponse<T>(res, schema, logger, path, start);
}
