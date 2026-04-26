import crypto from "crypto";

import { type NextRequest, NextResponse } from "next/server";

import { runWithRequestContext } from "@/shared/request/request-context.server";
import { buildCSP } from "@/shared/security/csp";

export function proxy(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;
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
