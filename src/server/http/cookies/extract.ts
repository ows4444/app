export function extractSafeCookiesFromRequest(req: Request): string {
  const raw = req.headers.get("cookie");
  if (!raw) return "";

  const allowed = ["session", "device_id"];

  return raw
    .split(";")
    .map((c) => c.trim())
    .filter((c) => allowed.some((key) => c.startsWith(`${key}=`)))
    .join("; ");
}
