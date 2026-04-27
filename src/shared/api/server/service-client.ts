import "server-only";

import { headers } from "next/headers";

import { SERVICES } from "@/config/services";
import { httpClient } from "@/server/bff/transport/http";

type CacheStrategy = { type: "dynamic" } | { type: "revalidate"; seconds: number } | { type: "static" };

function resolveCache(strategy?: CacheStrategy) {
  if (!strategy || strategy.type === "dynamic") {
    return { cache: "no-store" as const };
  }

  if (strategy.type === "static") {
    return { cache: "force-cache" as const };
  }

  return {
    cache: "force-cache" as const,
    next: { revalidate: strategy.seconds },
  };
}

export async function serviceClient<T>(
  path: string,
  options: {
    service: keyof typeof SERVICES;
    method?: string;
    body?: unknown;
    cache?: RequestCache;
  },
): Promise<T> {
  const headerStore = await headers();

  const safeCookies = headerStore.get("cookie") ?? "";

  return httpClient<T>(
    `${SERVICES[options.service]}${path}`,
    {
      method: options.method ?? "GET",
      headers: {
        "content-type": "application/json",
        cookie: safeCookies,
      },
      cache: options.cache ?? "no-store",
    },
    {
      service: options.service,
      timeout: 3000,
      idempotent: options.method === "GET",
    },
  );
}
