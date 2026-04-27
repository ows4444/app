export function getTrustedIP(req: Request): string {
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "anonymous";

  return "anonymous";
}
