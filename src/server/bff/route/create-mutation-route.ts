import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { routeLogger } from "@/server/observability/logger/with-context.server";
import { attachCsrf } from "@/server/security/csrf/csrf.rotation";
import { decodeDeviceId } from "@/server/security/device-id.server";

import { normalizeErrorResponse } from "./normalize-error";

type Handler<T> = (req: NextRequest) => Promise<T> | T;

export function createMutationRoute<T>(handler: Handler<T>) {
  return async function POST(req: NextRequest): Promise<Response> {
    const start = Date.now();

    try {
      const data = await handler(req);

      const res = NextResponse.json(data);

      const cookieStore = await cookies();
      const deviceRaw = cookieStore.get("device_id")?.value;
      const deviceId = decodeDeviceId(deviceRaw);

      if (deviceId) {
        return attachCsrf(res, { deviceId });
      }

      return res;
    } catch (err) {
      routeLogger.error("MUTATION_ROUTE_ERROR", {
        error: err,
        path: req.nextUrl.pathname,
        duration: Date.now() - start,
      });

      return normalizeErrorResponse(err);
    }
  };
}
