import { NextResponse, type NextRequest } from "next/server";
import { createMutation } from "@/shared/server/route/create-route";
import { errorResponse } from "@/shared/server/route/error-response";
import { type AppRouteHandler } from "@/shared/server/route/types";
import { serviceClient } from "@/server/http/upstream.client";
import {
  validateOrigin,
  validateRoutePolicy,
  validateQuery,
  validateAuth,
  validateBody,
  validateRateLimit,
} from "@/server/proxy/validators";
async function baseHandler(req: Request, ctx: { params: { path: string[] } }) {
  const { params } = ctx;
  const nextReq = req as unknown as NextRequest;
  const checks = [
    () => validateOrigin(nextReq),
    () => validateRoutePolicy(nextReq, params),
    () => validateQuery(nextReq),
    () => validateAuth(nextReq),
    () => validateBody(nextReq),
  ];
  const rateLimitFailure = await validateRateLimit(nextReq);
  if (rateLimitFailure) return rateLimitFailure;
  const failure = checks.map((c) => c()).find(Boolean);
  if (failure) return failure;
  const safePath = params.path.map((segment) => encodeURIComponent(segment)).join("/");
  const headers: Record<string, string> = {};
  for (const [key, value] of req.headers) {
    const k = key.toLowerCase();
    if (
      k === "content-type" ||
      k === "accept" ||
      k === "authorization" ||
      k === "x-request-id" ||
      k === "x-csrf-token" ||
      k === "accept-language" ||
      k === "user-agent"
    ) {
      headers[k as keyof typeof headers] = value;
    }
  }
  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers["cookie"] = cookie;
  }
  try {
    const body = !["GET", "HEAD"].includes(req.method) ? await req.text() : undefined;
    const upstream = await serviceClient<unknown>("API", `/${safePath}`, {
      method: req.method,
      headers,
      ...(body ? { body } : {}),
    });
    const res = NextResponse.json(upstream.data, {
      status: upstream.status,
      headers: {
        "Cache-Control": "no-store",
        Vary: "Cookie",
      },
    });
    if ("cookies" in upstream && upstream.cookies) {
      for (const cookie of upstream.cookies) {
        res.headers.append("set-cookie", cookie);
      }
    }
    return res;
  } catch (err) {
    const isTimeout = err instanceof DOMException && err.name === "AbortError";
    return errorResponse("UPSTREAM_FAILURE", isTimeout ? "Upstream timeout" : "Upstream service unavailable", 502);
  }
}
const mutationHandler = createMutation(baseHandler as AppRouteHandler);
async function adapt(handler: AppRouteHandler, req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const resolved = await ctx.params;
  return handler(req, { params: resolved });
}
export const GET = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) =>
  adapt(baseHandler as AppRouteHandler, req, ctx);
export const POST = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) =>
  adapt(mutationHandler, req, ctx);
export const PUT = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => adapt(mutationHandler, req, ctx);
export const PATCH = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) =>
  adapt(mutationHandler, req, ctx);
export const DELETE = (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) =>
  adapt(mutationHandler, req, ctx);
