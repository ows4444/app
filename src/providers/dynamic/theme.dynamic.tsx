import { getServerTheme } from "@/shared/theme/theme.server";

export async function getThemeData() {
  return getServerTheme();
}
