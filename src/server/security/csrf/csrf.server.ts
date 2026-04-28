import crypto from "crypto";

import "server-only";
import { env } from "@/config/server/env";

import { safeEqual } from "./csrf.core";

const CSRF_SECRET = env.CSRF_SECRET;

type CsrfPayload = {
  token: string;
  iat: number;
  exp: number;
  deviceId: string;
};

function sign(value: string): string {
  return crypto.createHmac("sha256", CSRF_SECRET).update(value).digest("hex");
}

function encode(payload: CsrfPayload): string {
  const json = JSON.stringify(payload);
  const signature = sign(json);
  return Buffer.from(`${json}.${signature}`).toString("base64");
}

export function decode(encoded: string): CsrfPayload | null {
  try {
    const raw = Buffer.from(encoded, "base64").toString("utf-8");
    const [json, signature] = raw.split(".");
    if (!json || !signature) return null;

    const expected = sign(json);
    if (!safeEqual(signature, expected)) return null;

    return JSON.parse(json);
  } catch {
    return null;
  }
}
export function generateCsrfToken(deviceId: string) {
  const now = Date.now();
  const payload: CsrfPayload = {
    token: crypto.randomBytes(32).toString("hex"),
    iat: now,
    exp: now + 1000 * 60 * 5,
    deviceId,
  };
  return encode(payload);
}
export function verifyCsrf(encoded: string): boolean {
  const payload = decode(encoded);
  if (!payload) return false;

  const now = Date.now();
  if (now > payload.exp) return false;

  if (payload.iat > now + 1000 * 10) return false;

  return true;
}
