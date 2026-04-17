import { type z } from "zod";

import { jsonHeaders } from "@/shared/lib/headers";
import { apiClient } from "@/shared/lib/infra/api-client/api-client.client";

type EndpointConfig<TInput, TOutput> = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  input?: z.ZodType<TInput>;
  output: z.ZodType<TOutput>;
  cache?: RequestCache;
  retry?: { retries?: number };
  tags?: string[];
  blocking?: boolean;
};

export function createEndpoint<TInput, TOutput>(config: EndpointConfig<TInput, TOutput>) {
  const fn = async (input?: TInput, signal?: AbortSignal): Promise<TOutput> => {
    if (config.input && input) {
      config.input.parse(input);
    }

    if (config.method === "GET" && input) {
      throw new Error("GET endpoints must not have input body");
    }

    const raw = await apiClient<TOutput>(config.path, {
      method: config.method ?? "GET",
      headers: jsonHeaders(),
      ...(input && config.method !== "GET" ? { body: JSON.stringify(input) } : {}),
      ...(config.cache !== undefined ? { cache: config.cache } : {}),
      ...(config.tags ? { next: { tags: config.tags } } : {}),
      ...(config.retry !== undefined ? { retry: config.retry } : {}),
      ...(signal ? { signal } : {}),
    });

    return config.output.parse(raw);
  };

  return Object.assign(fn, {
    meta: {
      tags: config.tags ?? [],
      blocking: config.blocking ?? false,
    },
  });
}
