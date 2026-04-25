import { NextResponse, type NextRequest } from "next/server";

import { SERVICE_TIMEOUTS } from "@/config/services";
import { serviceClient } from "@/server/http/upstream.client";
import { routeLogger } from "@/server/observability/logger/with-context.server";
import { isSafeMethod } from "@/server/security/csrf.core";
import { assertValidCsrf } from "@/server/security/csrf.guard";
import { errorResponse } from "@/shared/server/route/error-response";

import {
  validateOrigin,
  validateRoutePolicy,
  validateQuery,
  validateAuth,
  validateBody,
  validateRateLimit,
  validateSchema,
} from "./validators";

type FetchMode = "no-store" | "force-cache";

function filterCookies(raw: string): string {
  return raw
    .split("; ")
    .filter((c) => c.startsWith("session=") || c.startsWith("csrf="))
    .join("; ");
}

export async function proxyHandler(req: NextRequest, path: string[]) {
  if (!isSafeMethod(req.method)) {
    try {
      assertValidCsrf(req);
    } catch {
      return errorResponse("CSRF_VALIDATION_FAILED", "Invalid CSRF token", 403);
    }
  }

  // 1. Rate limit (async)
  const rateLimitFailure = await validateRateLimit(req);
  if (rateLimitFailure) return rateLimitFailure;

  // 2. Sync validations
  const checks = [
    () => validateOrigin(req),
    () => validateRoutePolicy(req, { path }),
    () => validateQuery(req),
    () => validateAuth(req),
    () => validateSchema(req, { path }),
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
      k === "x-csrf-token" ||
      k === "accept-language" ||
      k === "user-agent"
    ) {
      headers[k] = value;
    }
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
          "Cache-Control": "no-store",
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
        res.headers.append("set-cookie", c);
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

    return errorResponse("UPSTREAM_FAILURE", isTimeout ? "Upstream timeout" : "Upstream service unavailable", 502);
  }
}
