import "server-only";
import { env } from "@/config/server/env";

export function buildCSP(nonce: string) {
  const isDev = env.NODE_ENV !== "production";

  const nonceValue = `'nonce-${nonce}'`;

  const api = new URL(env.API_SERVICE_URL).origin;
  const auth = new URL(env.AUTH_SERVICE_URL).origin;
  return [
    "default-src 'self'",

    `script-src 'self' ${nonceValue} 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""}`,

    "script-src-attr 'none'",

    `style-src 'self' ${isDev ? "'unsafe-inline'" : nonceValue}`,
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${api} ${auth}`,

    "worker-src 'self' blob:",
    "frame-src 'self'",
    "block-all-mixed-content",

    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "report-to csp-endpoint",
    "report-uri /api/csp-report",
    "upgrade-insecure-requests",
  ].join("; ");
}
