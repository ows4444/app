import { serviceClient } from "@/server/http/upstream.client";
import { createQuery, extractUpstreamError, normalizeErrorResponse } from "@/shared/server/route/create-route";
export const runtime = "nodejs";
export const GET = createQuery(async (req) => {
  const upstream = await serviceClient("AUTH", "/auth/me", {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      authorization: req.headers.get("authorization") ?? "",
    },
  });
  const error = extractUpstreamError(upstream.data);
  if (error) {
    return Response.json(normalizeErrorResponse(error), { status: upstream.status });
  }
  return Response.json(upstream.data, {
    status: upstream.status,
    headers: {
      "Cache-Control": "no-store",
      Vary: "Cookie",
    },
  });
});
