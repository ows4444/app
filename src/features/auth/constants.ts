export const AUTH_QUERY_KEYS = {
  ME: (locale: string) => ["auth", "me", locale] as const,
};
