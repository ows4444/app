import { type z } from "zod";

import { syncCsrfToken } from "@/shared/api/core/csrf";
import { performFetch } from "@/shared/api/core/fetch";
import { handleResponse } from "@/shared/api/core/response";
import { getCsrfToken } from "@/shared/security/csrf.client";
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

  const isCsrfError = res.headers.get("x-error-code") === "CSRF_INVALID";

  if (res.status === 403 && isCsrfError) {
    await fetch("/api/auth/csrf", { credentials: "include" });

    const freshToken = getCsrfToken();

    const retryHeaders = {
      ...(extraHeaders ?? {}),
      ...(options.headers ?? {}),
      ...(freshToken ? { "x-csrf-token": freshToken } : {}),
    };

    const retryRes = await performFetch(path, options, retryHeaders);

    syncCsrfToken(retryRes);

    return handleResponse<T>(retryRes, schema, logger, path, start);
  }

  return handleResponse<T>(res, schema, logger, path, start);
}
