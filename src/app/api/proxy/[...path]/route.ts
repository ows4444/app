import { type NextRequest } from "next/server";

import { proxyHandler } from "@/server/proxy/proxy-handler";
import { createMutation } from "@/shared/server/route/create-route";

async function adapt(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const { path } = await ctx.params;

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
