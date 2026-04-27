import { type z } from "zod";

import { syncCsrfToken } from "@/shared/api/core/csrf";
import { performFetch } from "@/shared/api/core/fetch";
import { handleResponse } from "@/shared/api/core/response";
import { type Logger } from "@/shared/types/logger";

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

  if (res.status === 403) {
    // attempt CSRF recovery once
    await fetch("/api/auth/csrf", { credentials: "include" });

    const retryRes = await performFetch(path, options, extraHeaders);

    syncCsrfToken(retryRes);

    return handleResponse<T>(retryRes, schema, logger, path, start);
  }

  return handleResponse<T>(res, schema, logger, path, start);
}
