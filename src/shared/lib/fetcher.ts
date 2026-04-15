export async function fetcher<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Fetch error");

  return res.json();
}
