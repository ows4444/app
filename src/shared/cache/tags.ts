export const CacheTags = {
  user: (id: string) => `user:${id}`,
  me: () => "user:me",
  stats: () => "stats",
  service: (name: string) => `service:${name}`,
} as const;

export type CacheTag =
  | ReturnType<typeof CacheTags.user>
  | ReturnType<typeof CacheTags.me>
  | ReturnType<typeof CacheTags.stats>
  | ReturnType<typeof CacheTags.service>;
