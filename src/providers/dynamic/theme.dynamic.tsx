import { getServerTheme } from "@/shared/theme/theme.server";

import { ThemeProvider } from "../theme-provider";

export async function ThemeDynamic({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = await getServerTheme();

  return <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>;
}
