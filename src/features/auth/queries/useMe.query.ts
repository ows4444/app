import { type UseQueryOptions } from "@tanstack/react-query";

import { type AppError } from "@/shared/core/errors";
import { useAppQuery } from "@/shared/infrastructure/react-query/create-query";

import { authApi } from "../api/auth.api";
import { AUTH_QUERY_KEYS } from "../constants";
import { mapUser } from "../mappers/user.mapper";

export const ME_QUERY_OPTIONS: Partial<
  Omit<UseQueryOptions<ReturnType<typeof mapUser>, AppError>, "queryKey" | "queryFn">
> = {
  staleTime: 5 * 60 * 1000, // 5 min
  retry: false,
  throwOnError: false, // ✅ don't crash UI
  refetchOnMount: "always",
  refetchOnReconnect: false,
};

export const useMeQuery = (locale: string) => {
  return useAppQuery<ReturnType<typeof mapUser>, AppError>({
    queryKey: AUTH_QUERY_KEYS.ME(locale),
    queryFn: async ({ signal }) => {
      const dto = await authApi.me(signal);
      return mapUser(dto);
    },
    ...ME_QUERY_OPTIONS,
  });
};
