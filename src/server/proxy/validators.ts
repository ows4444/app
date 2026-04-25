import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/config/server/env";
import { decode } from "../security/csrf.server";
import { rateLimit } from "../security/rate-limit";
import { redisRateLimitStore } from "../cache/rate-limit-store";
export const runtime = "nodejs";
export function validateOrigin(req: NextRequest) {
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!origin) return null;
  try {
    const allowed = new URL(env.NEXT_PUBLIC_APP_URL).origin;
    const incoming = new URL(origin).origin;
    if (incoming !== allowed) {
      return NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "Forbidden origin" } }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: { code: "INVALID_ORIGIN", message: "Invalid origin header" } }, { status: 403 });
  }
  return null;
}
export function validateAuth(req: NextRequest) {
  const cookie = req.headers.get("cookie");
  if (!cookie) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Missing auth context" } }, { status: 401 });
  }
  const csrf = cookie
    .split("; ")
    .find((c) => c.startsWith("csrf="))
    ?.split("=")[1];
  if (!csrf || !decode(csrf)) {
    return NextResponse.json(
      { error: { code: "INVALID_SESSION", message: "Invalid session context" } },
      { status: 401 },
    );
  }
  return null;
}
export async function validateRateLimit(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const auth = req.headers.get("authorization") ?? "";
  const key = `${ip}:${auth.slice(0, 20)}`;
  const rl = await rateLimit(key, redisRateLimitStore);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests" } },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } },
    );
  }
  return null;
}
export function validateQuery(req: NextRequest) {
  for (const [key, value] of req.nextUrl.searchParams.entries()) {
    if (key.length > 50 || value.length > 500) {
      return NextResponse.json(
        { error: { code: "INVALID_QUERY", message: "Invalid query parameters" } },
        { status: 400 },
      );
    }
  }
  return null;
}
export function validateBody(req: NextRequest) {
  const MAX_BODY_SIZE = 1024 * 10;
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Payload too large" } }, { status: 413 });
  }
  if (!["GET", "HEAD"].includes(req.method)) {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Only JSON supported" } },
        { status: 415 },
      );
    }
  }
  return null;
}
export function validateRoutePolicy(req: NextRequest, params: { path: string[] }) {
  const ROUTE_POLICY: Record<string, string[]> = {
    auth: ["GET", "POST"],
    users: ["GET"],
  };
  const [firstSegment] = params.path;
  if (!firstSegment || !(firstSegment in ROUTE_POLICY)) {
    return NextResponse.json({ error: { code: "FORBIDDEN", message: "Access denied" } }, { status: 403 });
  }
  const policy = Object.prototype.hasOwnProperty.call(ROUTE_POLICY, firstSegment)
    ? ROUTE_POLICY[firstSegment as keyof typeof ROUTE_POLICY]
    : undefined;
  if (!policy?.includes(req.method)) {
    return NextResponse.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" } }, { status: 405 });
  }
  return null;
}
