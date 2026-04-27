import z from "zod";

import { SERVICES } from "@/config/services";
import { createMutationRoute } from "@/server/bff/route/create-mutation-route";
import { httpClient } from "@/server/bff/transport/http";
import { extractSafeCookiesFromRequest } from "@/server/http/cookies/extract";
import { HttpError } from "@/shared/core/errors";

export const POST = createMutationRoute({
  request: z.object({}), // empty
  response: z.object({ success: z.boolean() }),

  handler: async ({ req }) => {
    const upstream = await httpClient(
      `${SERVICES.AUTH}/auth/logout`,
      {
        method: "POST",
        headers: {
          cookie: extractSafeCookiesFromRequest(req),
        },
      },
      { service: "auth", timeout: 3000, idempotent: false },
    );

    if (!upstream) {
      throw new HttpError(500, "LOGOUT_FAILED");
    }

    return { success: true };
  },
});
