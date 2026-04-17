import { type z } from "zod";

import { jsonHeaders } from "@/shared/lib/headers";
import { apiClient } from "@/shared/lib/infra/api-client";

type EndpointConfig<TInput, TOutput> = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  input?: z.ZodType<TInput>;
  output: z.ZodType<TOutput>;

  cache?: RequestCache;
  dedupeTTL?: number;
  retry?: {
    retries?: number;
  };
  tags?: string[];
  priority?: "high" | "low";
};

export function createEndpoint<TInput, TOutput>(config: EndpointConfig<TInput, TOutput>) {
  const fn = async (input?: TInput, signal?: AbortSignal): Promise<TOutput> => {
    if (config.input && input) {
      config.input.parse(input); // ✅ validate input
    }

    const raw = await apiClient(config.path, {
      method: config.method ?? "GET",
      headers: jsonHeaders(),

      ...(input ? { body: JSON.stringify(input) } : {}),
      ...(config.cache !== undefined ? { cache: config.cache } : {}),
      ...(config.dedupeTTL !== undefined ? { dedupeTTL: config.dedupeTTL } : {}),
      ...(config.retry !== undefined ? { retry: config.retry } : {}),
      ...(config.priority !== undefined ? { priority: config.priority } : {}),
      ...(config.tags !== undefined ? { tags: config.tags } : {}),
      ...(signal ? { signal } : {}),
    });

    return config.output.parse(raw); // ✅ validate output
  };

  // ✅ Attach metadata for React Query consumption
  return Object.assign(fn, {
    meta: {
      priority: config.priority ?? "low",
      tags: config.tags ?? [],
    },
  });
}
