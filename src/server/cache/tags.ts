export const CacheTags = {
  user: (id: string) => `user:${id}`,
  auth: () => "auth",
  users: () => "users",
} as const;
