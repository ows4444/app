export const CacheTags = {
  user: (id: string) => `user:${id}`,
  users: () => "users",
} as const;
