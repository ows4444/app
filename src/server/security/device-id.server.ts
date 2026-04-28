import crypto from "crypto";

import { env } from "@/config/server/env";

import { timingSafeEqual } from "./csrf/csrf.core";

function sign(value: string) {
  return crypto.createHmac("sha256", env.SESSION_SECRET).update(value).digest();
}

export function encodeDeviceId(id: string) {
  const sig = sign(id);

  const payload = Buffer.concat([Buffer.from(id, "utf-8"), Buffer.from("."), sig]);

  return payload.toString("base64url");
}

export function decodeDeviceId(cookie: string | undefined): string | null {
  if (!cookie) return null;

  try {
    const raw = Buffer.from(cookie, "base64url");

    const dotIndex = raw.indexOf(".");
    if (dotIndex === -1) return null;

    const id = raw.subarray(0, dotIndex).toString("utf-8");
    const sig = raw.subarray(dotIndex + 1);

    if (!id || sig.length === 0) return null;

    const expected = sign(id);

    if (!timingSafeEqual(expected, sig)) {
      return null;
    }

    return id;
  } catch {
    return null;
  }
}

export function generateDeviceId() {
  return crypto.randomUUID();
}
