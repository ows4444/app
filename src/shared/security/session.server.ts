import crypto from "crypto";

import { env } from "@/config/env";
import "server-only";

const SECRET = env.SESSION_SECRET;

type SessionPayload = {
  user: {
    id: string;
    name: string;
  };
  iat: number;
  exp: number;
};

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createSession(user: SessionPayload["user"]) {
  const now = Date.now();

  const payload: SessionPayload = {
    user,
    iat: now,
    exp: now + 1000 * 60 * 60 * 24, // 24h
  };

  const json = JSON.stringify(payload);
  const signature = sign(json);

  return Buffer.from(`${json}.${signature}`).toString("base64");
}

export function verifySession(encoded?: string): SessionPayload | null {
  try {
    if (!encoded) return null;

    const raw = Buffer.from(encoded, "base64").toString("utf-8");
    const [json, signature] = raw.split(".");

    if (!json || !signature) return null;

    const expected = sign(json);

    if (!timingSafeEqual(signature, expected)) return null;

    const payload = JSON.parse(json) as SessionPayload;

    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

// reuse your existing util if you want
function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let result = 0;

  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
