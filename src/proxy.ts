import crypto from "crypto";

import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/config/env";
import { normalizeError } from "@/shared/lib/errors/normalize";
import { defaultLocale, type Locale, locales } from "@/shared/lib/i18n/config";
import { createAbortSignal } from "@/shared/lib/infra/abort/abort";
import { withContext } from "@/shared/lib/infra/logger/with-context.server";
import { metrics } from "@/shared/lib/infra/metrics";
import { getServerRequestContext } from "@/shared/lib/request-context/request-context.server";
import {
  generateCsrfPair,
  getCsrfCookieName,
  getCsrfHeaderName,
  getCsrfSigCookieName,
  isSafeMethod,
  verifyCsrf,
} from "@/shared/lib/security/csrf.server";

const API_URL = (() => {
  try {
    return new URL(env.API_URL);
  } catch {
    throw new Error(`Invalid API_URL: ${env.API_URL}`);
  }
})();

function resolveLocale(req: NextRequest): Locale {
  const cookieLocale = req.cookies.get("locale")?.value as Locale | undefined;

  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  const accept = req.headers.get("accept-language") ?? "";

  if (accept.includes("ar")) return "ar";

  return defaultLocale;
}

export async function proxy(req: NextRequest) {
  const nonce = crypto.randomBytes(16).toString("base64");
  const { traceId } = await getServerRequestContext();

  const log = withContext({
    traceId,
    path: req.nextUrl.pathname,
    method: req.method,
    userAgent: req.headers.get("user-agent"),
  });

  const { pathname, search } = req.nextUrl;

  const locale = resolveLocale(req);

  let response: NextResponse;

  const existing = req.cookies.get("locale")?.value;

  const shouldSetLocale = existing !== locale;

  if (!pathname.startsWith("/api")) {
    response = NextResponse.next();
  } else {
    const origin = req.headers.get("origin");
    const host = req.nextUrl.origin;

    // ✅ STRICT origin validation (no substring matching)
    if (!isSafeMethod(req.method) && origin && origin !== host) {
      log.warn("Invalid origin", { origin, host });

      return new NextResponse("Forbidden - Origin mismatch", { status: 403 });
    }

    if (!isSafeMethod(req.method)) {
      const csrfToken = req.cookies.get(getCsrfCookieName())?.value ?? "";
      const csrfSig = req.cookies.get(getCsrfSigCookieName())?.value ?? "";
      const csrfHeader = req.headers.get(getCsrfHeaderName()) ?? "";

      if (!csrfToken || !csrfSig || !csrfHeader) {
        log.warn("CSRF validation failed - missing parts");
        metrics.increment("proxy.csrf_blocked");

        return new NextResponse("Forbidden - CSRF", { status: 403 });
      }

      if (csrfToken !== csrfHeader) {
        log.warn("CSRF validation failed - token mismatch");
        metrics.increment("proxy.csrf_blocked");

        return new NextResponse("Forbidden - CSRF", { status: 403 });
      }

      if (!verifyCsrf(csrfToken, csrfSig)) {
        log.warn("CSRF validation failed - invalid signature");
        metrics.increment("proxy.csrf_blocked");

        return new NextResponse("Forbidden - CSRF", { status: 403 });
      }
    }

    const upstreamPath = pathname.replace(/^\/api/, "") || "/";
    const target = new URL(upstreamPath + search, API_URL);

    const start = Date.now();

    try {
      log.info("Incoming request", {
        method: req.method,
        path: pathname,
      });

      const headers = new Headers();

      const allowedHeaders = ["accept", "content-type", "authorization", "x-request-id"];

      const ip = req.headers.get("x-forwarded-for") ?? "unknown";

      headers.set("x-forwarded-for", ip);

      for (const key of allowedHeaders) {
        const value = req.headers.get(key);
        if (value) headers.set(key, value);
      }

      const cookie = req.headers.get("cookie");

      if (cookie) headers.set("cookie", cookie);

      headers.set("x-csp-nonce", nonce);
      headers.set("accept-language", locale);
      headers.set("x-request-id", traceId);
      headers.delete("host");
      headers.delete("connection");
      headers.delete("content-length");
      headers.delete("accept-encoding");
      headers.set("x-forwarded-proto", req.nextUrl.protocol);

      const cloned = req.clone();

      const init: RequestInit & { duplex?: "half" } = {
        method: req.method,
        headers,
        ...(req.method !== "GET" && req.method !== "HEAD"
          ? { body: await cloned.arrayBuffer(), duplex: "half" as const }
          : {}),
      };

      const signal = createAbortSignal({
        ...(req.signal ? { parent: req.signal } : {}),
        timeout: Number(process.env.PROXY_TIMEOUT ?? 8000),
      });

      if (signal.aborted) {
        metrics.increment("proxy.aborted");
        log.warn("Request aborted by client");
      }

      const proxyRes = await fetch(target, {
        ...init,
        signal,
      });

      metrics.increment("proxy.success", {
        route: pathname,
        method: req.method,
      });

      log.info("Proxy success", {
        status: proxyRes.status,
        duration: Date.now() - start,
      });

      metrics.histogram("proxy.duration", Date.now() - start);

      const resHeaders = new Headers(proxyRes.headers);

      resHeaders.delete("content-encoding");
      resHeaders.delete("transfer-encoding");
      resHeaders.delete("connection");

      response = new NextResponse(proxyRes.body, {
        status: proxyRes.status,
        headers: resHeaders,
      });

      const csrfTokenCookie = req.cookies.get(getCsrfCookieName())?.value;
      const csrfSigCookie = req.cookies.get(getCsrfSigCookieName())?.value;

      if (!csrfTokenCookie || !csrfSigCookie) {
        const { token, signature } = generateCsrfPair();

        // readable token (for client → header)
        response.cookies.set(getCsrfCookieName(), token, {
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        // httpOnly signature (server-only)
        response.cookies.set(getCsrfSigCookieName(), signature, {
          path: "/",
          sameSite: "lax",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
      }

      response.headers.set("x-frame-options", "DENY");
      response.headers.set("x-content-type-options", "nosniff");
      response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
      response.headers.set("x-xss-protection", "1; mode=block");
      response.headers.set("strict-transport-security", "max-age=63072000; includeSubDomains; preload");
      response.headers.set(
        "content-security-policy",
        [
          "default-src 'self'",
          `script-src 'self' 'nonce-${nonce}'`,
          `style-src 'self' 'unsafe-inline'`,
          "img-src 'self' data:",
          "font-src 'self'",
          "connect-src 'self' https:",
          "frame-ancestors 'none'",
        ].join("; "),
      );

      response.headers.set("Accept-CH", "Sec-CH-Prefers-Color-Scheme");

      response.headers.set("cache-control", "no-store");
    } catch (err) {
      log.error("Proxy failed", {
        duration: Date.now() - start,
        error: normalizeError(err),
      });

      metrics.increment("proxy.failure");

      response = new NextResponse("Upstream error", { status: 502 });
    }
  }

  if (shouldSetLocale) {
    response.cookies.set("locale", locale, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
