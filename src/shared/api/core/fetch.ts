import { createAbortSignal } from "@/server/infra/api-client/abort/abort";
export async function performFetch(path: string, options: RequestInit = {}, extraHeaders?: HeadersInit) {
  const base = typeof window === "undefined" ? (process.env.NEXT_PUBLIC_APP_URL ?? "") : "";
  const signal = createAbortSignal({
    parent: options.signal ?? null,
    timeout: 8000,
  });
  return fetch(`${base}${path}`, {
    ...options,
    credentials: "include",
    signal,
    cache: options.cache ?? "no-store",
    headers: {
      ...(options.headers ?? {}),
      ...(extraHeaders ?? {}),
    },
  });
}
