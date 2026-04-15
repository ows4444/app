import { useMeQuery } from "../queries/useMe.query";

export function useAuth() {
  const { data, isLoading, error } = useMeQuery();

  return {
    user: data ?? null,
    isLoading,
    isAuthenticated: !!data,
    error,
  };
}
