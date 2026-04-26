import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";

import { cookies, headers } from "next/headers";
import { cache } from "react";

const storage = new AsyncLocalStorage<{ traceId: string }>();

export const getServerRequestContext = cache(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const traceId =
    headerStore.get("x-request-id") ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "fallback-trace-id");
  return {
    traceId,
    locale: cookieStore.get("locale")?.value ?? null,
  };
});
export function runWithRequestContext<T>(traceId: string, fn: () => T): T {
  return storage.run({ traceId }, fn);
}
export function getTraceId(): string | undefined {
  return storage.getStore()?.traceId;
}
