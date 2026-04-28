import "server-only";
import crypto from "crypto";

export const CSRF_COOKIE = "csrf";
export const CSRF_HEADER = "x-csrf-token";

export function isSafeMethod(method: string) {
  return ["GET", "HEAD", "OPTIONS"].includes(method);
}
export function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

export function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf-8");
  const bBuf = Buffer.from(b, "utf-8");

  if (aBuf.length !== bBuf.length) return false;

  return crypto.timingSafeEqual(aBuf, bBuf);
}

export const runtime = "nodejs";
