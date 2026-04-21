export function getCookie<T = string>(name: string): T | null {
  if (typeof document === "undefined") return null;

  const match = RegExp(new RegExp("(^| )" + name + "=([^;]+)")).exec(document.cookie);

  return match ? (match[2] as unknown as T) : null;
}
