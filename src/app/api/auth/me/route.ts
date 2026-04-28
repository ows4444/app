import { env } from "@/config/server/env";
import { mapApiUserToDomain } from "@/entities/user";
import { apiUserSchema } from "@/server/bff/contracts/user.contract";
import { createQueryRoute } from "@/server/bff/route/create-query-route";
import { httpClient } from "@/server/bff/transport/http";
import { redisRateLimitStore } from "@/server/cache/rate-limit-store";
import { extractSafeCookiesFromRequest } from "@/server/http/cookies/extract";
import { getTrustedIP } from "@/server/http/request/get-trusted-ip";
import { rateLimit } from "@/server/security/rate-limit";

export const GET = createQueryRoute(async (req) => {
  const ip = getTrustedIP(req);

  const rl = await rateLimit(`me:${ip}`, redisRateLimitStore, { limit: 60 });

  if (!rl.allowed) {
    return Response.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const { data: upstream } = await httpClient(
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

export const runtime = "nodejs";
