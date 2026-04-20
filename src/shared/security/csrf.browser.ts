export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.split("; ").find((c) => c.startsWith("csrf_token="));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}
