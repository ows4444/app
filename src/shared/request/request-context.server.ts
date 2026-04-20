import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";

export const getServerRequestContext = cache(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  return {
    traceId:
      headerStore.get("x-request-id") ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36)),
    locale: cookieStore.get("locale")?.value ?? null,
  };
});
