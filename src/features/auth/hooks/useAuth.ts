import { useLocale } from "@/shared/i18n/client";

import { useMeQuery } from "../queries/useMe.query";

export function useAuth() {
  const locale = useLocale();
  const { data, isLoading, error } = useMeQuery(locale);

  return {
    user: data ?? null,
    isLoading,
    isAuthenticated: !!data,
    error,
  };
}
