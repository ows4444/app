import { registerMessages } from "@/shared/lib/i18n/registry";

const loaders = {
  en: () => import("./en.json").then((m) => m.default),
  ar: () => import("./ar.json").then((m) => m.default),
} as const;

registerMessages("auth", async (locale) => {
  const load = loaders[locale as keyof typeof loaders] ?? loaders.en;
  return load();
});
