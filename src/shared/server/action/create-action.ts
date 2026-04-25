"use server";

import { type z } from "zod";

import { assertValidCsrf } from "@/server/security/csrf.guard";

const MAX_BODY_SIZE = 1024 * 10; // 10kb

export async function createServerAction<T extends z.ZodTypeAny, R>(
  schema: T,
  handler: (data: z.infer<T>) => Promise<R>,
) {
  return async (input: unknown): Promise<R> => {
    const raw = JSON.stringify(input);

    if (raw.length > MAX_BODY_SIZE) {
      throw new Error("PAYLOAD_TOO_LARGE");
    }

    const parsed = schema.safeParse(input);

    if (!parsed.success) {
      throw new Error("INVALID_INPUT");
    }

    try {
      const req = (globalThis as unknown as { __request?: Request }).__request;

      if (req) {
        assertValidCsrf(req);
      }
    } catch {
      throw new Error("CSRF_VALIDATION_FAILED");
    }

    return handler(parsed.data);
  };
}
