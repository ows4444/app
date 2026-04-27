import { env } from "@/config/server/env";
import { mapApiUserToDomain } from "@/entities/user";
import { apiUserSchema } from "@/server/bff/contracts/user.contract";
import { createQueryRoute } from "@/server/bff/route/create-query-route";
import { httpClient } from "@/server/bff/transport/http";
import { extractSafeCookiesFromRequest } from "@/server/http/cookies/extract";

export const GET = createQueryRoute(async (req) => {
  const upstream = await httpClient(
    `${env.AUTH_SERVICE_URL}/auth/me`,
    {
      method: "GET",
      headers: {
        cookie: extractSafeCookiesFromRequest(req),
      },
    },
    { service: "auth", timeout: 3000, idempotent: true },
  );

  const parsed = apiUserSchema.parse(upstream);

  return mapApiUserToDomain(parsed);
});
