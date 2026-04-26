import { NextResponse, type NextRequest } from "next/server";

import { SERVICE_TIMEOUTS } from "@/config/services";
import { serviceClient } from "@/server/http/upstream.server";
import { routeLogger } from "@/server/observability/logger/with-context.server";
import { hardenSetCookie } from "@/shared/server/cookies/parse-and-harden";
import { normalizeErrorResponse } from "@/shared/server/route/create-route";

import {
  validateOrigin,
  validateRoutePolicy,
  validateQuery,
  validateAuth,
  validateBody,
  validateRateLimit,
} from "./validators";

function filterCookies(raw: string): string {
  return raw
    .split("; ")
    .filter((c) => c.startsWith("session=") || c.startsWith("csrf="))
    .join("; ");
}

export async function proxyHandler(req: NextRequest, path: string[]) {
  // 1. Rate limit (async)
  const rateLimitFailure = await validateRateLimit(req);
  if (rateLimitFailure) return rateLimitFailure;

  // 2. Sync validations
  const checks = [
    () => validateOrigin(req),
    () => validateRoutePolicy(req, { path }),
    () => validateQuery(req),
    () => validateAuth(req),
    () => validateBody(req),
  ];

  const failure = checks.map((c) => c()).find(Boolean);
  if (failure) return failure;

  // 3. Safe path
  const safePath = path.map((s) => encodeURIComponent(s)).join("/");

  // 4. Header forwarding (explicit allowlist)
  const headers: Record<string, string> = {};

  for (const [key, value] of req.headers) {
    const k = key.toLowerCase();

    if (
      k === "content-type" ||
      k === "accept" ||
      k === "x-request-id" ||
      k === "traceparent" ||
      k === "x-csrf-token" ||
      k === "accept-language" ||
      k === "user-agent"
    ) {
      headers[k] = value;
    }
  }

  const csrf = req.headers.get("x-csrf-token");

  if (csrf && !headers["x-csrf-token"]) {
    headers["x-csrf-token"] = csrf;
  }

  const cookie = req.headers.get("cookie");
  if (cookie) headers["cookie"] = filterCookies(cookie);

  try {
    const body = !["GET", "HEAD"].includes(req.method) ? await req.text() : undefined;

    const start = Date.now();

    const upstream = await serviceClient<unknown>("API", `/${safePath}`, {
      method: req.method,
      headers,
      ...(body ? { body } : {}),
      signal: AbortSignal.timeout(SERVICE_TIMEOUTS.API),
    });

    const res = NextResponse.json(
      { data: upstream.data },
      {
        status: upstream.status,
        headers: {
          "Cache-Control": upstream.status >= 500 ? "no-store" : "private, max-age=60",
          Vary: "Cookie",
        },
      },
    );

    routeLogger.info("PROXY_SUCCESS", {
      path: safePath,
      method: req.method,
      status: upstream.status,
      duration: Date.now() - start,
    });

    if ("cookies" in upstream && upstream.cookies) {
      for (const c of upstream.cookies) {
        res.headers.append("set-cookie", hardenSetCookie(c));
      }
    }

    return res;
  } catch (err) {
    routeLogger.error("PROXY_FAILURE", {
      path: safePath,
      method: req.method,
      error: err instanceof Error ? err.message : "unknown",
    });

    const isTimeout = err instanceof DOMException && err.name === "AbortError";

    return NextResponse.json(normalizeErrorResponse(isTimeout ? "Upstream timeout" : "Upstream service unavailable"), {
      status: 502,
    });
  }
}
