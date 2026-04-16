import { useSafeQuery } from "@/shared/lib/infra/react-query/use-safe-query";
import { authApi } from "../api/auth.api";
import { AUTH_QUERY_KEYS } from "../constants";
import { mapUser } from "../mappers/user.mapper";

export const useMeQuery = (locale?: string) => {
  const query = useSafeQuery({
    queryKey: [...AUTH_QUERY_KEYS.ME, locale],
    queryFn: async () => {
      const dto = await authApi.me();
      return mapUser(dto);
    },
    staleTime: 60_000,
    retry: false,
  });

  return query;
};
