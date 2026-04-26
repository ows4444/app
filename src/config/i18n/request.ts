import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import ar from "@/config/i18n/messages/ar.json";
import en from "@/config/i18n/messages/en.json";

import { defaultLocale, locales } from "./routing";

const messagesMap = {
  en,
  ar,
} as const;

function isLocale(value: string | undefined): value is (typeof locales)[number] {
  return !!value && (locales as readonly string[]).includes(value);
}

export const runtime = "nodejs";
export default getRequestConfig(async () => {
  const store = await cookies();
  const raw = store.get("locale")?.value;
  const locale = isLocale(raw) ? raw : defaultLocale;
  return {
    locale,
    messages: messagesMap[locale],
  };
});
