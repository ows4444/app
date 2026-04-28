import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";

import { cookies, headers } from "next/headers";

const storage = new AsyncLocalStorage<{ traceId: string }>();

export async function getServerRequestContext() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const traceId =
    headerStore.get("x-request-id") ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "fallback-trace-id");
  return {
    traceId,
    locale: cookieStore.get("locale")?.value ?? null,
  };
}
export function runWithRequestContext<T>(traceId: string, fn: () => T): T {
  return storage.run({ traceId }, fn);
}
export function getTraceId(): string | undefined {
  return storage.getStore()?.traceId;
}

export const runtime = "nodejs";
