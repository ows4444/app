import { type NextRequest } from "next/server";

import { proxyHandler } from "@/server/proxy/proxy-handler";
import { createMutation } from "@/shared/server/route/create-route";

export const runtime = "nodejs";

async function adapt(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const { path } = await ctx.params;

  if (!Array.isArray(path) || path.some((p) => p.length > 100)) {
    return new Response(JSON.stringify({ error: { code: "INVALID_PATH", message: "Invalid path" } }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
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
