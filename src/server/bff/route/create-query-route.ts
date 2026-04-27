import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { redisRateLimitStore } from "@/server/cache/rate-limit-store";
import { getTrustedIP } from "@/server/http/request/get-trusted-ip";
import { decodeDeviceId } from "@/server/security/device-id.server";
import { rateLimit } from "@/server/security/rate-limit";

import { normalizeErrorResponse } from "./normalize-error";
import { validateOrigin } from "./origin.guard";

export function createQueryRoute<T>(handler: (req: Request) => Promise<T>) {
  return async (req: Request): Promise<Response> => {
    try {
      validateOrigin(req);

      const cookieStore = await cookies();
      const deviceId = decodeDeviceId(cookieStore.get("device_id")?.value) ?? "anon";
      const ip = getTrustedIP(req);
      const key = `${ip}:${deviceId}`;
      const rl = await rateLimit(key, redisRateLimitStore, { limit: 60 });

      if (!rl.allowed) {
        return NextResponse.json({ error: { code: "RATE_LIMITED" } }, { status: 429 });
      }

      const result = await handler(req);

      return NextResponse.json(
        { data: result },
        {
          headers: {
            "Cache-Control": "no-store",
            Vary: "Cookie",
          },
        },
      );
    } catch (err) {
      return normalizeErrorResponse(err);
    }
  };
}
