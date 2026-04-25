import { z } from "zod";
import { HttpError } from "@/shared/core/errors";
import { Logger } from "@/server/observability/logger/contracts/logger";
import { apiResponseSchema } from "@/server/infra/api-client/api-response.schema";
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
    const parsed = apiResponseSchema(schema ?? z.unknown()).safeParse(json);
    if (!parsed.success) {
      throw new HttpError(res.status, "INVALID_RESPONSE_FORMAT");
    }
    if (parsed.data.error) {
      throw new HttpError(res.status, parsed.data.error);
    }
    return parsed.data.data as T;
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
    throw new HttpError(res.status, json?.message ?? "HTTP_ERROR");
  }
  const text = await res.text();
  throw new HttpError(res.status, text || "HTTP_ERROR");
}
