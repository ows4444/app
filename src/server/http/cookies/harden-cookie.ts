export function hardenSetCookie(raw: string): string {
  if (!raw) return raw;

  // ⚠️ do NOT split cookies — just append attributes safely
  let cookie = raw;

  if (!cookie.toLowerCase().includes("secure")) {
    cookie += "; Secure";
  }

  if (!cookie.toLowerCase().includes("httponly")) {
    cookie += "; HttpOnly";
  }

  if (!cookie.toLowerCase().includes("samesite")) {
    cookie += "; SameSite=Strict";
  }

  return cookie;
}
