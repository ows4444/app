import { type NextRequest } from "next/server";

import { serviceClient } from "@/server/http/upstream.server";
import { hardenSetCookie } from "@/shared/server/cookies/parse-and-harden";
import { createMutation, extractUpstreamError, normalizeErrorResponse } from "@/shared/server/route/create-route";

export const runtime = "nodejs";
export const POST = createMutation(async (req: NextRequest) => {
  const upstream = await serviceClient<unknown>("AUTH", "/auth/logout", {
    method: "POST",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
  });
  const error = extractUpstreamError(upstream.data);

  if (error) {
    return Response.json(normalizeErrorResponse(error), { status: upstream.status });
  }

  const res = Response.json(
    { data: upstream.data },
    {
      status: upstream.status,
      headers: {
        "Cache-Control": "no-store",
        Vary: "Cookie",
      },
    },
  );

  if ("cookies" in upstream && upstream.cookies) {
    for (const cookie of upstream.cookies) {
      res.headers.append("set-cookie", hardenSetCookie(cookie));
    }
  }

  return res;
});
