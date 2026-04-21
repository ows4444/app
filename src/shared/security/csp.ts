export function buildCSP(nonce: string) {
  const isDev = process.env.NODE_ENV !== "production";

  return [
    "default-src 'self'",

    // ✅ STRICT SCRIPT CONTROL
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""}`,

    // ✅ STYLE (still needs inline for Tailwind, but restricted)
    "style-src 'self' 'unsafe-inline'",

    // 🚫 prevent inline JS attributes
    "script-src-attr 'none'",
    "style-src-attr 'none'",

    // ✅ safe assets
    "img-src 'self' data: blob:",
    "font-src 'self' data:",

    // ✅ network control
    "connect-src 'self' https:",

    // ✅ clickjacking protection
    "frame-ancestors 'none'",

    // ✅ base restrictions
    "base-uri 'self'",
    "form-action 'self'",

    // ✅ block dangerous stuff
    "object-src 'none'",

    // ✅ HTTPS enforcement
    "upgrade-insecure-requests",

    // 🔥 NEW — Trusted Types (XSS hardening)
    ...(isDev ? [] : ["require-trusted-types-for 'script'"]),
  ].join("; ");
}
