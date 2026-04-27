import { createQuery, extractUpstreamError, normalizeErrorResponse } from "@/server/bff/route/create-route";
import { serviceClient } from "@/server/http/upstream.server";

export const GET = createQuery(async (req: Request) => {
  const upstream = await serviceClient("AUTH", "/auth/me", {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
  });
  const error = extractUpstreamError(upstream.data);

  if (error) {
    return Response.json(normalizeErrorResponse(error), { status: upstream.status });
  }

  return Response.json(
    { data: upstream.data },
    {
      status: upstream.status,
      headers: {
        "Cache-Control": "no-store",
        Vary: "Cookie",
      },
    },
  );
});
