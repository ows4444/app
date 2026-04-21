export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  return (
    document.cookie
      .split("; ")
      .map((c) => c.split("="))
      .find(([key]) => key === name)?.[1] ?? null
  );
}
