export function getCookie<T = string>(name: string): T | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));

  return match ? (match[2] as unknown as T) : null;
}
