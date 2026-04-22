import "server-only";

import { headers } from "next/headers";

import { env } from "@/config/env";
import { mapToDomainError } from "@/shared/core/errors/error-mapper";
import { normalizeError } from "@/shared/core/errors/normalize";
import { apiLogger } from "@/shared/infra/logger/with-context.server";

type ServiceName = "AUTH" | "API";

function resolveServiceUrl(service: ServiceName) {
  switch (service) {
    case "AUTH":
      return env.AUTH_SERVICE_URL;
    case "API":
      return env.API_SERVICE_URL;
  }
}

export async function serviceClient<T>(service: ServiceName, path: string, options: RequestInit = {}): Promise<T> {
  const start = Date.now();

  try {
    const headerStore = await headers();

    const traceId = headerStore.get("x-request-id");

    const res = await fetch(`${resolveServiceUrl(service)}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
        ...(traceId ? { "x-request-id": traceId } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000), // 5 seconds timeout
    });

    if (!res.ok) {
      const text = await res.text();

      apiLogger.error("SERVICE_ERROR", {
        service,
        path,
        status: res.status,
        duration: Date.now() - start,
      });

      throw new Error(text || "SERVICE_ERROR");
    }

    return await res.json();
  } catch (err) {
    apiLogger.error("SERVICE_FAILURE", {
      service,
      path,
      duration: Date.now() - start,
      error: normalizeError(err),
    });

    throw mapToDomainError(err);
  }
}
