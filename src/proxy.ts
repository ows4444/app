import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/config/env";
import { normalizeError } from "@/shared/lib/errors/normalize";
import { defaultLocale, type Locale, locales } from "@/shared/lib/i18n/config";
import { withContext } from "@/shared/lib/infra/logger/with-context";

const API_URL = (() => {
  try {
    return new URL(env.API_URL);
  } catch {
    throw new Error(`Invalid API_URL: ${env.API_URL}`);
  }
})();

function resolveLocale(req: NextRequest) {
  const cookieLocale = req.cookies.get("locale")?.value as Locale | undefined;

  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  const accept = req.headers.get("accept-language") ?? "";

  if (accept.includes("ar")) return "ar";

  return defaultLocale;
}

export async function proxy(req: NextRequest) {
  const traceId = req.headers.get("x-request-id") ?? crypto.randomUUID();

  const log = withContext({ traceId, path: req.nextUrl.pathname });

  const { pathname, search } = req.nextUrl;

  const locale = resolveLocale(req);

  let response: NextResponse;

  const existing = req.cookies.get("locale")?.value;

  const shouldSetLocale = existing !== locale;

  if (!pathname.startsWith("/api")) {
    response = NextResponse.next();
  } else {
    const target = new URL(pathname.replace(/^\/api/, "") + search, API_URL);

    const start = Date.now();

    try {
      log.info("Incoming request");
      const headers = new Headers(req.headers);

      const cookie = req.headers.get("cookie");

      if (cookie) headers.set("cookie", cookie);

      headers.set("accept-language", locale);
      headers.delete("host");
      headers.delete("connection");
      headers.delete("content-length");
      headers.set("x-forwarded-proto", req.nextUrl.protocol);
      const init: RequestInit & { duplex?: "half" } = {
        method: req.method,
        headers,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
      };

      if (req.method !== "GET" && req.method !== "HEAD") {
        init.duplex = "half";
      }
      const proxyRes = await fetch(target, init);

      log.info("Proxy success", {
        status: proxyRes.status,
        duration: Date.now() - start,
      });

      const resHeaders = new Headers(proxyRes.headers);

      resHeaders.delete("content-encoding");
      resHeaders.delete("transfer-encoding");
      resHeaders.delete("connection");

      response = new NextResponse(proxyRes.body, {
        status: proxyRes.status,
        headers: resHeaders,
      });
    } catch (err) {
      log.error("Proxy failed", {
        duration: Date.now() - start,
        error: normalizeError(err),
      });
      response = new NextResponse("Upstream error", { status: 502 });
    }
  }

  if (shouldSetLocale) {
    response.cookies.set("locale", locale, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: ["/:path*"],
};
