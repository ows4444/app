import crypto from "crypto";

import { env } from "@/config/server/env";

function sign(value: string) {
  return crypto.createHmac("sha256", env.SESSION_SECRET).update(value).digest("hex");
}

export function encodeDeviceId(id: string) {
  const sig = sign(id);
  return Buffer.from(`${id}.${sig}`).toString("base64");
}

export function decodeDeviceId(cookie: string | undefined): string | null {
  if (!cookie) return null;

  try {
    const raw = Buffer.from(cookie, "base64").toString("utf-8");
    const [id, sig] = raw.split(".");

    if (!id || !sig) return null;

    const expected = sign(id);

    if (expected !== sig) return null;

    return id;
  } catch {
    return null;
  }
}

export function generateDeviceId() {
  return crypto.randomUUID();
}
