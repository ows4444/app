import "server-only";

import { headers } from "next/headers";

import { SERVICES } from "@/config/services";
import { httpClient } from "@/server/bff/transport/http";
import { extractSafeCookiesFromRequest } from "@/server/http/cookies/extract";
import { decodeDeviceId } from "@/server/security/device-id.server";
import { type CacheTag } from "@/shared/cache/tags";

export async function serviceClient<T>(
  path: string,
  options: {
    service: keyof typeof SERVICES;
    method?: string;
    body?: unknown;
    cache: RequestCache;
    next?: {
      revalidate?: number;
      tags?: CacheTag[];
    };
    schema?: (data: unknown) => T;
  },
): Promise<T> {
  const headerStore = await headers();

  const userAgent = headerStore.get("user-agent");
  const forwardedFor = headerStore.get("x-forwarded-for");
  const realIp = headerStore.get("x-real-ip");

  const cookieHeader = headerStore.get("cookie") ?? "";
  const safeCookies = extractSafeCookiesFromRequest(
    new Request("http://localhost", {
      headers: { cookie: cookieHeader },
    }),
  );

  const rawDevice = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("device_id="))
    ?.split("=")[1];

  const deviceId = decodeDeviceId(rawDevice);

  const { data } = await httpClient<T>(
    `${SERVICES[options.service]}${path}`,
    {
      method: options.method ?? "GET",
      headers: {
        "content-type": "application/json",
        ...(safeCookies ? { cookie: safeCookies } : {}),
        ...(deviceId ? { "x-device-id": deviceId } : {}),
        ...(userAgent ? { "user-agent": userAgent } : {}),
        ...(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
        ...(realIp ? { "x-real-ip": realIp } : {}),
      },
      cache: options.cache,
      next: options.next,
    },
    {
      service: options.service,
      timeout: 3000,
      idempotent: options.method === "GET",
    },
  );

  if (options.schema) {
    return options.schema(data);
  }

  return data;
}
