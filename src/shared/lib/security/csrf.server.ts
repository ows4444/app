import crypto from "crypto";
import "server-only";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_SIG_COOKIE_NAME = "csrf_sig";
const CSRF_HEADER_NAME = "x-csrf-token";

if (!process.env.CSRF_SECRET) {
  throw new Error("CSRF_SECRET must be defined");
}

const CSRF_SECRET = process.env.CSRF_SECRET;

function sign(value: string): string {
  return crypto.createHmac("sha256", CSRF_SECRET).update(value).digest("hex");
}

export function getCsrfSigCookieName() {
  return CSRF_SIG_COOKIE_NAME;
}

export function generateCsrfPair() {
  const token = crypto.randomBytes(32).toString("hex");
  const signature = sign(token);

  return { token, signature };
}

export function getCsrfCookieName() {
  return CSRF_COOKIE_NAME;
}

export function getCsrfHeaderName() {
  return CSRF_HEADER_NAME;
}

export function isSafeMethod(method: string) {
  return ["GET", "HEAD", "OPTIONS"].includes(method);
}

export function verifyCsrf(token: string, signature: string): boolean {
  if (!token || !signature) return false;

  const expected = sign(token);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}
