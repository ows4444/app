import { NextResponse } from "next/server";

import { env } from "@/config/server/env";
import { generateCsrfToken, decode } from "@/server/security/csrf.server";

export async function GET() {
  const encoded = generateCsrfToken();
  const payload = decode(encoded);

  if (!payload) {
    return NextResponse.json({ error: "CSRF_INIT_FAILED" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("csrf", encoded, {
    httpOnly: true,
    sameSite: "strict",
    secure: env.NODE_ENV === "production",
    path: "/",
  });

  res.headers.set("x-csrf-token", payload.token);

  return res;
}
