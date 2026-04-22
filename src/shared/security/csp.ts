import { env } from "@/config/env";

export function buildCSP(nonce: string) {
  const isDev = env.NODE_ENV !== "production";

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.google.com https://www.gstatic.com ${
      isDev ? "'unsafe-eval'" : ""
    }`,
    "style-src 'self' 'unsafe-inline'",
    "frame-src 'self' https://www.google.com",
    "img-src 'self' data: blob: https://www.google.com https://www.gstatic.com",
    "font-src 'self' data:",
    "connect-src 'self' https://www.google.com https://www.gstatic.com https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
    ...(isDev ? [] : ["require-trusted-types-for 'script'"]),
  ].join("; ");
}
