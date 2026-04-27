import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { env } from "@/config/server/env";
import { decode, generateCsrfToken } from "@/server/security/csrf/csrf.server";
import { decodeDeviceId } from "@/server/security/device-id.server";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const deviceRaw = cookieStore.get("device_id")?.value;
  const deviceId = decodeDeviceId(deviceRaw);

  if (!deviceId) {
    return NextResponse.json({ error: "DEVICE_INVALID" }, { status: 403 });
  }

  const encoded = generateCsrfToken(deviceId);
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
