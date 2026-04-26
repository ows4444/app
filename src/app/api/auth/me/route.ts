import { serviceClient } from "@/server/http/upstream.server";
import { createQuery, extractUpstreamError, normalizeErrorResponse } from "@/shared/server/route/create-route";

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
