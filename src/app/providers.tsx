import ClientProviders from "@/providers/providers.client";
import { ThemeProvider } from "@/providers/theme-provider";
import { type Theme } from "@/shared/theme";

export function Providers({
  children,
  initialTheme,
}: Readonly<{
  children: React.ReactNode;
  initialTheme: Theme;
}>) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ClientProviders>{children}</ClientProviders>
    </ThemeProvider>
  );
}
