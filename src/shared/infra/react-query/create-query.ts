import { useQuery, type QueryKey, type UseQueryOptions } from "@tanstack/react-query";

export function useAppQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    ...options,
  });
}
