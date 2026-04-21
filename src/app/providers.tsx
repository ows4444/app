import ClientProviders from "@/providers/providers.client";
import { ThemeProvider } from "@/providers/theme-provider";

export function Providers({
  children,
  initialTheme,
  csrfToken,
}: Readonly<{
  children: React.ReactNode;
  initialTheme: "light" | "dark";
  csrfToken: string | null;
}>) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ClientProviders csrfToken={csrfToken}>{children}</ClientProviders>
    </ThemeProvider>
  );
}
