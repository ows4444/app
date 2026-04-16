import { useSafeQuery } from "@/shared/lib/infra/react-query/use-safe-query";
import { isErr } from "@/shared/lib/result";

import { authApi } from "../api/auth.api";
import { AUTH_QUERY_KEYS } from "../constants";
import { mapUser } from "../mappers/user.mapper";

export const useMeQuery = (locale?: string) => {
  const query = useSafeQuery({
    queryKey: [...AUTH_QUERY_KEYS.ME, locale],
    queryFn: async () => {
      const res = await authApi.me();

      if (isErr(res)) {
        throw res.error;
      }

      return mapUser(res.data);
    },
    staleTime: 60_000,
    retry: false,
  });

  return query;
};
