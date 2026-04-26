import { headers } from "next/headers";
import { z } from "zod";

import { serviceClient } from "@/server/http/upstream.server";
import { hardenSetCookie } from "@/shared/server/cookies/parse-and-harden";
import {
  createValidatedMutation,
  extractUpstreamError,
  normalizeErrorResponse,
} from "@/shared/server/route/create-route";

export const runtime = "nodejs";
const loginSchema = z.object({
  identifier: z.union([z.email(), z.string().regex(/^9715\d{8}$/)], {
    error: () => ({ message: "Must be a valid email or UAE phone number starting with 9715" }),
  }),
});

export const POST = createValidatedMutation(loginSchema, async (parsed, req) => {
  const headerStore = await headers();
  const upstream = await serviceClient<unknown>("AUTH", "/auth/login", {
    method: "POST",
    body: JSON.stringify(parsed),
    headers: {
      "content-type": "application/json",
      "x-request-id": headerStore.get("x-request-id") ?? "",
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
