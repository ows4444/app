import { cookies, headers } from "next/headers";

export async function getRequestContext() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  const traceId = headerStore.get("x-request-id") ?? crypto.randomUUID();

  const locale = cookieStore.get("locale")?.value;

  return {
    traceId,
    locale,
    headers: headerStore,
    cookies: cookieStore,
  };
}
