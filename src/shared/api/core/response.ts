import { type z } from "zod";

import { HttpError } from "@/shared/core/errors";
import { type Logger } from "@/shared/types/logger";

export async function handleResponse<T>(
  res: Response,
  schema: z.ZodType<T> | undefined,
  logger: Logger,
  path: string,
  start: number,
): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";

  if (!res.ok) {
    logger.error("API ERROR", { path, status: res.status, duration: Date.now() - start });

    throw await handleErrorResponse(res, contentType, schema);
  }

  if (contentType.includes("application/json")) {
    const json = await res.json();

    if (!json || typeof json !== "object") {
      throw new HttpError(res.status, "INVALID_RESPONSE_FORMAT");
    }

    if ("error" in json) {
      const err = json as { error?: { message?: string } | string };
      const message = typeof err.error === "string" ? err.error : (err.error?.message ?? "HTTP_ERROR");
      throw new HttpError(res.status, message);
    }

    if (schema) {
      return schema.parse(json);
    }

    return json as T;
  }

  if (schema) {
    throw new HttpError(res.status, "EXPECTED_JSON_RESPONSE");
  }

  return (await res.text()) as T;
}

async function handleErrorResponse(res: Response, contentType: string, schema?: z.ZodTypeAny) {
  if (contentType.includes("application/json")) {
    const json = await res.json().catch(() => null);

    if (schema) {
      const parsed = schema.safeParse(json);
      if (!parsed.success) throw new HttpError(res.status, "INVALID_RESPONSE");

      return parsed.data;
    }

    if (json && typeof json === "object" && "error" in json) {
      const err = json as { error?: { message?: string } | string };
      const message = typeof err.error === "string" ? err.error : (err.error?.message ?? "HTTP_ERROR");

      throw new HttpError(res.status, message);
    }

    throw new HttpError(res.status, extractClientErrorMessage(json));
  }

  const text = await res.text();
  throw new HttpError(res.status, text || "HTTP_ERROR");
}

function extractClientErrorMessage(json: unknown): string {
  if (
    typeof json === "object" &&
    json !== null &&
    "message" in json &&
    typeof (json as Record<string, unknown>).message === "string"
  ) {
    return String((json as Record<string, unknown>).message);
  }

  return "HTTP_ERROR";
}
