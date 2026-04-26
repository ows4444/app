import { cookies, headers } from "next/headers";
import { type z } from "zod";

import { assertValidCsrf } from "@/server/security/csrf.guard";

const MAX_BODY_SIZE = 1024 * 10; // 10kb

export function createServerAction<T extends z.ZodTypeAny, R>(
  schema: T,

  handler: (data: z.infer<T>, ctx: { headers: Headers }) => Promise<R>,
) {
  return async (input: unknown): Promise<R> => {
    const headerStore = await headers();
    const cookieStore = await cookies();

    const req = new Request("http://localhost", {
      headers: new Headers({
        cookie: cookieStore.toString(),
        "x-csrf-token": headerStore.get("x-csrf-token") ?? "",
      }),
    });

    assertValidCsrf(req);
    const raw = JSON.stringify(input);

    if (raw.length > MAX_BODY_SIZE) {
      throw new Error("PAYLOAD_TOO_LARGE");
    }

    const parsed = schema.safeParse(input);

    if (!parsed.success) {
      throw new Error("INVALID_INPUT");
    }

    return handler(parsed.data, {
      headers: new Headers(),
    });
  };
}
