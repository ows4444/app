import { createAbortSignal } from "@/shared/api/core/abort/abort";

export async function performFetch(path: string, options: RequestInit = {}, extraHeaders?: HeadersInit) {
  const signal = createAbortSignal({
    parent: options.signal ?? null,
    timeout: 8000,
  });
  return fetch(`${path}`, {
    ...options,
    credentials: "include",
    signal,
    ...(options.cache !== undefined ? { cache: options.cache } : {}),
    headers: {
      ...(options.headers ?? {}),
      ...(extraHeaders ?? {}),
    },
  });
}
