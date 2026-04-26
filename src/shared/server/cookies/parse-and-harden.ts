export function hardenSetCookie(raw: string): string {
  const parts = raw.split(";").map((p) => p.trim());

  const base = parts[0];

  const attrs = new Map<string, string | boolean>();

  for (const part of parts.slice(1)) {
    const [k, v] = part.split("=");

    if (k) attrs.set(k.toLowerCase(), v ?? true);
  }

  attrs.set("samesite", "Strict");
  attrs.set("secure", true);
  attrs.set("httponly", true);

  return [base, ...Array.from(attrs.entries()).map(([k, v]) => (v === true ? k : `${k}=${v}`))].join("; ");
}
