import { HttpError } from "./errors";

export async function serverFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new HttpError(res.status, text || "HTTP_ERROR");
    }

    const contentType = res.headers.get("content-type") ?? "";
    const text = await res.text();

    if (!text) return undefined as T;

    if (contentType.includes("application/json")) {
      return JSON.parse(text) as T;
    }

    return text as T;
  } finally {
    clearTimeout(timeout);
  }
}
