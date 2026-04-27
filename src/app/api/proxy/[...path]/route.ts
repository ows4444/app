import { type NextRequest } from "next/server";

import { createMutation } from "@/server/http/route/create-route";
import { proxyHandler } from "@/server/proxy/proxy-handler";

/**
 * 🔒 SSRF HARDENING: Explicit route allowlist
 * Only these top-level segments are allowed to be proxied.
 */
const ALLOWED_PROXY_ROUTES = new Set(["auth", "users"]);

async function adapt(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const { path } = await ctx.params;

  if (!Array.isArray(path) || path.some((p) => p.length > 100)) {
    return new Response(JSON.stringify({ error: { code: "INVALID_PATH", message: "Invalid path" } }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  /**
   * 🔒 SSRF HARDENING: Validate first segment against allowlist
   * Prevents arbitrary upstream routing like:
   *   /api/proxy/http://evil.com
   */
  const [firstSegment] = path;

  if (!firstSegment || !ALLOWED_PROXY_ROUTES.has(firstSegment)) {
    return new Response(
      JSON.stringify({
        error: {
          code: "FORBIDDEN_ROUTE",
          message: "Proxy route not allowed",
        },
      }),
      {
        status: 403,
        headers: { "content-type": "application/json" },
      },
    );
  }

  const res = await proxyHandler(req, path);

  if (!res) {
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "Proxy returned empty response",
        },
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  return res;
}

const mutation = createMutation(adapt);

export const GET = adapt;
export const POST = mutation;
export const PUT = mutation;
export const PATCH = mutation;
export const DELETE = mutation;
