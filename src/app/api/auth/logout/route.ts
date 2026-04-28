import { SERVICES } from "@/config/services";
import { createMutationRoute } from "@/server/bff/route/create-mutation-route";
import { validateOrigin } from "@/server/bff/route/origin.guard";
import { httpClient } from "@/server/bff/transport/http";
import { extractSafeCookiesFromRequest } from "@/server/http/cookies/extract";
import { assertValidCsrf } from "@/server/security/csrf/csrf.guard";

export const POST = createMutationRoute(async (req) => {
  validateOrigin(req);
  await assertValidCsrf(req);
  await httpClient(
    `${SERVICES.AUTH}/auth/logout`,
    {
      method: "POST",
      headers: {
        cookie: extractSafeCookiesFromRequest(req),
      },
    },
    { service: "auth", timeout: 3000, idempotent: false },
  );

  return { success: true };
});

export const runtime = "nodejs";
