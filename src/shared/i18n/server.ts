import { cookies, headers } from "next/headers";

import { resolveLocaleFromRequest } from "@/shared/i18n/resolve-locale";

import { defaultLocale, type Locale } from "./config";
import { getMessageLoaders } from "./registry";

const globalLoaders = {
  en: () => import("./messages/en.json").then((m) => m.default),
  ar: () => import("./messages/ar.json").then((m) => m.default),
} as const;

export async function getMessages(locale: Locale) {
  const load = globalLoaders[locale] ?? globalLoaders[defaultLocale];

  const global = await load();

  const loaders = getMessageLoaders();

  const entries = await Promise.all(
    Object.entries(loaders).map(async ([key, loader]) => {
      const data = (await loader(locale)) ?? {};

      return [key, data];
    }),
  );

  return {
    __locale: locale,
    ...global,
    ...Object.fromEntries(entries),
  };
}

export async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();

  const headerStore = await headers();

  return resolveLocaleFromRequest(cookieStore.get("locale")?.value, headerStore.get("accept-language"));
}
