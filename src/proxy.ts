import crypto from "crypto";

import { type NextRequest, NextResponse } from "next/server";

import { generateDeviceId, encodeDeviceId } from "@/server/security/device-id.server";
import { runWithRequestContext } from "@/shared/request/request-context.server";
import { buildCSP } from "@/shared/security/csp";

import { env } from "./config/server/env";

export function proxy(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;

    const origin = req.headers.get("origin");

    const forwardedHost = req.headers.get("x-forwarded-host");
    const host = forwardedHost ?? req.headers.get("host");

    if (!host) {
      return new NextResponse("Invalid host", { status: 400 });
    }

    const allowedOrigin = new URL(env.NEXT_PUBLIC_APP_URL);

    if (origin && origin !== allowedOrigin.origin) {
      return new NextResponse("Origin mismatch", { status: 403 });
    }

    const normalizedHost = host.toLowerCase();
    const expectedHost = allowedOrigin.host.toLowerCase();

    if (normalizedHost !== expectedHost) {
      return new NextResponse("Forbidden host", { status: 403 });
    }

    const proto = req.headers.get("x-forwarded-proto") ?? "http";

    if (env.NODE_ENV === "production" && proto !== "https") {
      return new NextResponse("HTTPS required", { status: 403 });
    }

    const lastSegment = pathname.split("/").pop();
    const isPublicFile = lastSegment?.includes(".") ?? false;

    if (pathname.startsWith("/_next") || pathname === "/favicon.ico" || isPublicFile) {
      return NextResponse.next();
    }

    // ✅ Generate per-request nonce (required for CSP)
    const nonce = crypto.randomBytes(16).toString("base64");
    const csp = buildCSP(nonce);

    const requestHeaders = new Headers(req.headers);

    requestHeaders.set("x-nonce", nonce);

    // ✅ Ensure request ID exists
    if (!requestHeaders.get("x-request-id")) {
      requestHeaders.set("x-request-id", crypto.randomUUID());
    }

    const traceId = String(requestHeaders.get("x-request-id"));

    return runWithRequestContext(traceId, () => {
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      // ✅ DEVICE COOKIE BOOTSTRAP
      const existingDevice = req.cookies.get("device_id")?.value;

      if (!existingDevice) {
        const id = generateDeviceId();
        const encoded = encodeDeviceId(id);

        const isProd = env.NODE_ENV === "production";

        response.cookies.set("device_id", encoded, {
          httpOnly: true,
          secure: isProd,
          sameSite: "strict",
          path: "/",
        });
      }

      response.headers.set("x-nonce", nonce);

      // ✅ REQUIRED: CSP must be set here (per-request nonce)
      response.headers.set("Content-Security-Policy", csp);

      response.headers.set(
        "Report-To",
        JSON.stringify({
          group: "csp-endpoint",
          max_age: 10886400,
          endpoints: [{ url: "/api/csp-report" }],
        }),
      );

      // ✅ Security headers only (cheap, safe)
      response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
      response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
      response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

      return response;
    });
  } catch {
    return new NextResponse("Proxy failure", { status: 500 });
  }
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
