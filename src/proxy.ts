import { type NextRequest, NextResponse } from "next/server";

import { buildCSP } from "@/shared/security/csp";
import { decode, generateCsrfToken } from "@/shared/security/csrf.server";

import { env } from "./config/env";
import { verifySession } from "./shared/security/session.server";

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const session = req.cookies.get("session")?.value;
  const payload = verifySession(session);
  const user = payload?.user ?? null;

  const nonce = crypto.randomUUID().replace(/-/g, "");
  const csp = buildCSP(nonce);

  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const csrfCookie = req.cookies.get("csrf")?.value;

  const locale = req.cookies.get("locale")?.value || "en";

  const existingLocale = req.cookies.get("locale")?.value;

  const requestHeaders = new Headers(req.headers);

  requestHeaders.set("x-nonce", nonce);

  if (!requestHeaders.get("x-request-id")) {
    requestHeaders.set("x-request-id", crypto.randomUUID());
  }

  const headers = new Headers(req.headers);

  headers.set("x-user", user ? JSON.stringify(user) : "");

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const shouldRotateCsrf = (() => {
    if (!csrfCookie) return true;

    const payload = decode(csrfCookie);
    if (!payload) return true;

    const now = Date.now();
    return payload.exp - now < 60_000;
  })();

  // CSRF bootstrap
  if (shouldRotateCsrf) {
    const encoded = generateCsrfToken();

    response.cookies.set("csrf", encoded, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      path: "/",
    });
  }

  if (existingLocale !== locale) {
    response.cookies.set("locale", locale, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: env.NODE_ENV === "production",
    });
  }

  response.headers.set("Content-Security-Policy", csp);

  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  return response;
}
