import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/config/server/env";
import { buildCSP } from "@/shared/security/csp";
import { runWithRequestContext } from "./shared/request/request-context.server";
import { generateCsrfToken } from "./server/security/csrf.server";
import { appLogger } from "./server/observability/logger/with-context.server";
export const runtime = "nodejs";
export function proxy(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;
    const lastSegment = pathname.split("/").pop();
    const isPublicFile = lastSegment?.includes(".") ?? false;
    if (pathname.startsWith("/_next") || pathname === "/favicon.ico" || isPublicFile) {
      return NextResponse.next();
    }
    const nonce = crypto.randomBytes(16).toString("base64");
    const csp = buildCSP(nonce);
    if (!nonce) {
      return new NextResponse("Failed to generate CSP nonce", { status: 500 });
    }
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);
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
      const csrfCookie = req.cookies.get("csrf")?.value;
      if (!csrfCookie) {
        const encoded = generateCsrfToken();
        response.cookies.set("csrf", encoded, {
          httpOnly: true,
          sameSite: "strict",
          secure: env.NODE_ENV === "production",
          path: "/",
        });
      }
      const existingLocale = req.cookies.get("locale")?.value;
      const locale = existingLocale || "en";
      if (existingLocale !== locale) {
        response.cookies.set("locale", locale, {
          path: "/",
          sameSite: "lax",
          httpOnly: true,
          secure: env.NODE_ENV === "production",
        });
      }
      response.headers.set("Content-Security-Policy", csp);
      if (env.NODE_ENV !== "production") {
        appLogger.debug("REQ", {
          path: req.nextUrl.pathname,
          method: req.method,
          traceId: requestHeaders.get("x-request-id"),
        });
      }
      response.headers.set(
        "Report-To",
        JSON.stringify({
          group: "csp-endpoint",
          max_age: 10886400,
          endpoints: [{ url: "/api/csp-report" }],
        }),
      );
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
