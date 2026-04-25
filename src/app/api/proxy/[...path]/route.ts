import { type NextRequest } from "next/server";

import { proxyHandler } from "@/server/proxy/proxy-handler";
import { createMutation } from "@/shared/server/route/create-route";

async function adapt(req: Request, ctx: { params: { path: string[] } }): Promise<Response> {
  const nextReq = req as unknown as NextRequest;

  const res = await proxyHandler(nextReq, ctx.params.path);

  if (!res) {
    // 🚨 MUST NEVER return null
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

const mutation = createMutation<{ params: { path: string[] } }>(adapt);

export const GET = adapt;
export const POST = mutation;
export const PUT = mutation;
export const PATCH = mutation;
export const DELETE = mutation;
