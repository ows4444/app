export function generateId(prefix = ""): string {
  const id =
    // eslint-disable-next-line sonarjs/pseudo-random
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return prefix ? `${prefix}_${id}` : id;
}
