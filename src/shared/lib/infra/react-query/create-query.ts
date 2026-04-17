import { useQuery, type QueryKey, type UseQueryOptions } from "@tanstack/react-query";

export function useAppQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
    endpoint?: { meta?: Record<string, unknown> };
  },
) {
  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    ...options,
    meta: {
      ...(options.endpoint?.meta ?? {}),
      ...(options.meta ?? {}),
    },
  });
}
