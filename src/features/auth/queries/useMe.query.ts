import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { AUTH_QUERY_KEYS } from "../constants";
import { mapUser } from "../mappers/user.mapper";

export const useMeQuery = () =>
  useQuery({
    queryKey: AUTH_QUERY_KEYS.ME,
    queryFn: async () => {
      const dto = await authApi.me();
      return mapUser(dto);
    },
    staleTime: 60_000,
    retry: false,
  });
