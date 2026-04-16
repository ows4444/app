import { QueryCache, QueryClient } from "@tanstack/react-query";

type RetryError = {
  status?: number;
};

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 10 * 60_000,
        networkMode: "always",

        retry: (failureCount, error: unknown) => {
          if (typeof navigator !== "undefined" && !navigator.onLine) {
            return false;
          }

          const err = error as RetryError;

          if (err?.status === 401) return false;

          return failureCount < 2;
        },

        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        networkMode: "always",
      },
    },
    queryCache: new QueryCache({}),
  });
}
