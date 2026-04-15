export function generateId(prefix = ""): string {
  const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return prefix ? `${prefix}_${id}` : id;
}
