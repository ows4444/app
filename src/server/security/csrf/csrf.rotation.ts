import { NextResponse } from "next/server";

import { env } from "@/config/server/env";

import { decode, generateCsrfToken } from "./csrf.server";

export async function attachCsrf(res: Response, ctx: { deviceId: string }): Promise<NextResponse> {
  const encoded = generateCsrfToken(ctx.deviceId);

  const payload = decode(encoded);

  if (!payload) {
    throw new Error("CSRF_DECODE_FAILED");
  }

  const next = new NextResponse(res.body, res);

  next.cookies.set("csrf", encoded, {
    httpOnly: true,
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
    path: "/",
  });

  next.headers.set("x-csrf-token", payload.token);

  return next;
}
