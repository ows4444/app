import { type NextRequest, NextResponse } from "next/server";

import { resolveLocaleFromRequest } from "@/shared/i18n/resolve-locale";
import { buildCSP } from "@/shared/security/csp";

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const nonce = crypto.randomUUID();
  const csp = buildCSP(nonce);

  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const locale = resolveLocaleFromRequest(req.cookies.get("locale")?.value, req.headers.get("accept-language"));

  const existingLocale = req.cookies.get("locale")?.value;

  const requestHeaders = new Headers(req.headers);

  if (!requestHeaders.get("x-request-id")) {
    requestHeaders.set("x-request-id", crypto.randomUUID());
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (existingLocale !== locale) {
    response.cookies.set("locale", locale, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  }

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-nonce", nonce);

  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|css|js)$).*)",
};
