import { SERVICES } from "@/config/services";
import { loginRequestSchema, loginResponseSchema, loginApiResponseSchema } from "@/server/bff/contracts/auth.contract";
import { mapLoginResponse } from "@/server/bff/mappers/auth.mapper";
import { createMutationRoute } from "@/server/bff/route/create-mutation-route";
import { httpClient } from "@/server/bff/transport/http";
import { extractSafeCookiesFromRequest } from "@/server/http/cookies/extract";

export const POST = createMutationRoute({
  request: loginRequestSchema,
  response: loginResponseSchema,
  handler: async ({ data, req }) => {
    const upstream = await httpClient(
      `${SERVICES.AUTH}/auth/login`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "content-type": "application/json",
          cookie: extractSafeCookiesFromRequest(req),
        },
      },
      { service: "auth", timeout: 3000, idempotent: false },
    );

    const parsed = loginApiResponseSchema.parse(upstream);

    return mapLoginResponse(parsed);
  },
});
