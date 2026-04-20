import { defaultLocale, type Locale, locales } from "./config";

export function resolveLocaleFromRequest(cookieLocale?: string, acceptLanguage?: string | null): Locale {
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  const accept = acceptLanguage ?? "";

  if (accept.includes("ar")) return "ar";

  return defaultLocale;
}
