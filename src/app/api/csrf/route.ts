import { NextResponse } from "next/server";

import { decode, generateCsrfToken } from "@/shared/security/csrf.server";

export function GET() {
  const encoded = generateCsrfToken();
  const payload = decode(encoded);

  if (!payload) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });

  // ✅ httpOnly (signed payload)
  res.cookies.set("csrf", encoded, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  // ✅ readable cookie (ONLY raw token)
  res.cookies.set("csrf_token", payload.token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res;
}
