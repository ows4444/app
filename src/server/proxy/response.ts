import { NextResponse } from "next/server";
import { extractUpstreamError } from "@/shared/server/route/create-route";
import { errorResponse } from "@/shared/server/route/error-response";
export async function handleJsonResponse(upstream: Response) {
  const json = await upstream.json();
  const error = extractUpstreamError(json);
  if (error) {
    return errorResponse("UPSTREAM_ERROR", error, upstream.status);
  }
  return NextResponse.json(json, {
    status: upstream.status,
    headers: {
      "Cache-Control": "no-store",
      Vary: "Cookie",
    },
  });
}
