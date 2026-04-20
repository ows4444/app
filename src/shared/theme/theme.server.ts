import { cookies, headers } from "next/headers";

import { type Theme } from "@/shared/theme/theme.types";

export async function getServerTheme(): Promise<Theme> {
  const cookieStore = await cookies();

  const cookieTheme = cookieStore.get("theme")?.value as Theme | undefined;
  if (cookieTheme) return cookieTheme;

  const headerStore = await headers();
  const secChPrefersColorScheme = headerStore.get("sec-ch-prefers-color-scheme");

  if (secChPrefersColorScheme === "dark") return "dark";

  return "light";
}
