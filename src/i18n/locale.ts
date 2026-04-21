import { cookies } from "next/headers";

import { defaultLocale } from "@/i18n/routing";

export async function getLocale() {
  const cookieStore = await cookies();
  return cookieStore.get("locale")?.value ?? defaultLocale;
}
