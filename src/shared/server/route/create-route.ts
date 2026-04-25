import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/config/server/env";
import { type AppRouteHandler } from "./types";
import { isSafeMethod } from "@/server/security/csrf.core";
import { assertValidCsrf } from "@/server/security/csrf.guard";
import { decode, generateCsrfToken } from "@/server/security/csrf.server";
export const runtime = "nodejs";
export function createValidatedMutation<T extends z.ZodTypeAny>(
  schema: T,
  handler: (data: z.infer<T>, req: Request, ctx: unknown) => Promise<Response>,
): AppRouteHandler {
  return createMutation(async (req, ctx) => {
    const MAX_BODY_SIZE = 1024 * 10; // 10kb
    const contentLength = req.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Payload too large" } }, { status: 413 });
    }
    const raw = await req.text();
    if (raw.length > MAX_BODY_SIZE) {
      return NextResponse.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Payload too large" } }, { status: 413 });
    }
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Invalid request payload" } },
        { status: 400 },
      );
    }
    return handler(parsed.data, req, ctx);
  });
}
export function extractUpstreamError(data: unknown): string | null {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as Record<string, unknown>).error === "string"
  ) {
    return (data as { error: string }).error;
  }
  return null;
}
export function normalizeErrorResponse(error: string) {
  return {
    error: {
      code: "UPSTREAM_ERROR",
      message: error,
    },
  };
}
export function createMutation(handler: AppRouteHandler): AppRouteHandler {
  return async (req, ctx) => {
    const MAX_BODY_SIZE = 1024 * 10; // 10kb
    const contentLength = req.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Payload too large" } }, { status: 413 });
    }
    if (!isSafeMethod(req.method)) {
      try {
        assertValidCsrf(req);
      } catch {
        return NextResponse.json(
          {
            error: {
              code: "CSRF_VALIDATION_FAILED",
              message: "Invalid CSRF token",
            },
          },
          { status: 403 },
        );
      }
    }
    const res = await handler(req, ctx);
    const encoded = generateCsrfToken();
    const payload = decode(encoded);
    const responseHeaders = new Headers(res.headers);
    const next = new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
    const headerStore = await headers();
    const traceId = headerStore.get("x-request-id");
    if (traceId) {
      next.headers.set("x-request-id", traceId);
    }
    if (payload) {
      next.cookies.set("csrf", encoded, {
        httpOnly: true,
        sameSite: "strict",
        secure: env.NODE_ENV === "production",
        path: "/",
      });
      next.headers.set("x-csrf-token", payload.token);
    } else {
      return NextResponse.json({ error: "CSRF_ROTATION_FAILED" }, { status: 500 });
    }
    return next;
  };
}
export function createQuery(handler: AppRouteHandler): AppRouteHandler {
  return handler;
}
