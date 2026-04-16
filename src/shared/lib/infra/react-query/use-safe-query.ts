"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { useQueryEffects } from "./use-query-effects";

export function useSafeQuery<TData, TError = unknown>(options: UseQueryOptions<TData, TError>) {
  const query = useQuery(options);

  useQueryEffects(query.error);

  return query;
}
