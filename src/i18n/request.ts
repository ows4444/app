import { getLocale, getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }: { requestLocale: Promise<string | undefined> }) => {
  const locale = (await requestLocale) ?? (await getLocale());

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
