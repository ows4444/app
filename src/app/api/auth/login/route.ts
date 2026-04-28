import { cookies } from "next/headers";

import { SERVICES } from "@/config/services";
import { loginRequestSchema, loginApiResponseSchema } from "@/server/bff/contracts/auth.contract";
import { mapLoginResponse } from "@/server/bff/mappers/auth.mapper";
import { createMutationRoute } from "@/server/bff/route/create-mutation-route";
import { validateOrigin } from "@/server/bff/route/origin.guard";
import { httpClient } from "@/server/bff/transport/http";
import { redisRateLimitStore } from "@/server/cache/rate-limit-store";
import { extractSafeCookiesFromRequest } from "@/server/http/cookies/extract";
import { hardenSetCookie } from "@/server/http/cookies/harden-cookie";
import { getTrustedIP } from "@/server/http/request/get-trusted-ip";
import { assertValidCsrf } from "@/server/security/csrf/csrf.guard";
import { rateLimit } from "@/server/security/rate-limit";

export const POST = createMutationRoute(async (req) => {
  validateOrigin(req);
  await assertValidCsrf(req);

  const cookieStore = await cookies();
  const deviceId = cookieStore.get("device_id")?.value;
  const ip = getTrustedIP(req);

  if (!deviceId) {
    return Response.json({ error: "DEVICE_REQUIRED" }, { status: 403 });
  }

  const rl = await rateLimit(`${ip}:${deviceId}`, redisRateLimitStore, { limit: 10 });

  if (!rl.allowed) {
    return Response.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const json = await req.json();
  const parsed = loginRequestSchema.parse(json);

  const { data: upstream, response } = await httpClient(
    `${SERVICES.AUTH}/auth/login`,
    {
      method: "POST",
      body: JSON.stringify(parsed),
      headers: {
        "content-type": "application/json",
        cookie: extractSafeCookiesFromRequest(req),
      },
    },
    { service: "auth", timeout: 3000, idempotent: false },
  );

  const parsedRes = loginApiResponseSchema.parse(upstream);

  const res = Response.json(mapLoginResponse(parsedRes));

  // ✅ Harden upstream cookies
  const setCookie = response.headers.getSetCookie();

  if (setCookie) {
    for (const cookie of setCookie) {
      res.headers.append("set-cookie", hardenSetCookie(cookie));
    }
  }

  return res;
});

export const runtime = "nodejs";
