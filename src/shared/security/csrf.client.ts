let csrfToken: string | null = null;
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? (match.split("=")[1] ?? null) : null;
}
export function setCsrfToken(token: string) {
  csrfToken = token;
}
export function getCsrfToken() {
  return csrfToken ?? readCookie("csrf");
}
export function clearCsrfToken() {
  csrfToken = null;
}
