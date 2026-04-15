import { QueryClient } from "@tanstack/react-query";

type RetryError = {
  status?: number;
};

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,

        retry: (failureCount, error: unknown) => {
          const err = error as RetryError | undefined;
          if (err?.status === 401) return false;
          return failureCount < 2;
        },

        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
    },
  });
}
