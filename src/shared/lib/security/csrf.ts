import crypto from "crypto";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString("hex");
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
