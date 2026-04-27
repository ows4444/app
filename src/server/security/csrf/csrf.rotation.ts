import { NextResponse } from "next/server";

import { decode, generateCsrfToken } from "./csrf.server";

export function attachCsrf(res: Response, ctx: { deviceId: string }): NextResponse {
  const encoded = generateCsrfToken(ctx.deviceId);
  const payload = decode(encoded)!;

  const next = new NextResponse(res.body, res);

  next.cookies.set("csrf", encoded, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  next.headers.set("x-csrf-token", payload.token);

  return next;
}
