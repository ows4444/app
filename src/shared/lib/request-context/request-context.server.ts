import { cookies, headers } from "next/headers";

export async function getRequestContext() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  return {
    traceId: headerStore.get("x-request-id") ?? crypto.randomUUID(),
    locale: cookieStore.get("locale")?.value ?? null,
  };
}
