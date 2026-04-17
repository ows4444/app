import { cookies } from "next/headers";

import { type Theme } from "@/shared/lib/theme/theme.types";

export async function getServerTheme(): Promise<Theme> {
  const cookieStore = await cookies();
  return (cookieStore.get("theme")?.value as Theme) ?? "light";
}
