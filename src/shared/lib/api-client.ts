import { ApiError } from "./errors";

export async function apiClient<T>(
  path: string,
  options?: RequestInit & { timeout?: number },
): Promise<T> {
  const controller = new AbortController();
  const timeout = options?.timeout ?? 10_000;

  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`/api${path}`, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(res.status, text || "API Error");
    }

    return res.json();
  } finally {
    clearTimeout(id);
  }
}
