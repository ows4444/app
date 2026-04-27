import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type z } from "zod";

import { redisRateLimitStore } from "@/server/cache/rate-limit-store";
import { hardenSetCookie } from "@/server/http/cookies/harden-cookie";
import { getTrustedIP } from "@/server/http/request/get-trusted-ip";
import { assertValidCsrf } from "@/server/security/csrf/csrf.guard";
import { attachCsrf } from "@/server/security/csrf/csrf.rotation";
import { decodeDeviceId } from "@/server/security/device-id.server";
import { rateLimit } from "@/server/security/rate-limit";

import { normalizeErrorResponse } from "./normalize-error";
import { validateOrigin } from "./origin.guard";

type Handler<TReq, TRes> = (ctx: { data: TReq; req: Request }) => Promise<TRes>;

type Options<TReq, TRes> = {
  request: z.ZodSchema<TReq>;
  response: z.ZodSchema<TRes>;
  handler: Handler<TReq, TRes>;
};

export function createMutationRoute<TReq, TRes>(opts: Options<TReq, TRes>) {
  return async (req: Request): Promise<Response> => {
    try {
      // -----------------------------
      // 1. ORIGIN VALIDATION
      // -----------------------------
      validateOrigin(req);

      // -----------------------------
      // 2. RATE LIMIT (device-aware)
      // -----------------------------
      const ip = getTrustedIP(req);
      const cookieStore = await cookies();
      const deviceId = decodeDeviceId(cookieStore.get("device_id")?.value) ?? "anon";

      const rlKey = `${ip}:${deviceId}`;

      const rl = await rateLimit(rlKey, redisRateLimitStore, { limit: 10 });

      if (!rl.allowed) {
        return NextResponse.json({ error: { code: "RATE_LIMITED" } }, { status: 429 });
      }

      // -----------------------------
      // 3. CSRF VALIDATION
      // -----------------------------
      await assertValidCsrf(req);

      // -----------------------------
      // 4. REQUEST VALIDATION
      // -----------------------------
      const json = await req.json().catch(() => null);

      const parsed = opts.request.safeParse(json);

      if (!parsed.success) {
        return NextResponse.json({ error: { code: "INVALID_INPUT" } }, { status: 400 });
      }

      // -----------------------------
      // 5. EXECUTE HANDLER
      // -----------------------------
      const result = await opts.handler({
        data: parsed.data,
        req,
      });

      // -----------------------------
      // 6. RESPONSE VALIDATION
      // -----------------------------
      const validated = opts.response.safeParse(result);

      if (!validated.success) {
        throw new Error("BFF_RESPONSE_INVALID");
      }

      // -----------------------------
      // 7. BUILD RESPONSE
      // -----------------------------
      const res = NextResponse.json(
        { data: validated.data },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store",
            Vary: "Cookie",
          },
        },
      );

      // -----------------------------
      // 8. COOKIE HARDENING
      // -----------------------------
      const setCookies = res.headers.getSetCookie?.() ?? [];

      for (const cookie of setCookies) {
        res.headers.append("set-cookie", hardenSetCookie(cookie));
      }

      // -----------------------------
      // 9. CSRF ROTATION (FIXED)
      // -----------------------------
      return attachCsrf(res, {
        deviceId,
      });
    } catch (err) {
      return normalizeErrorResponse(err);
    }
  };
}
