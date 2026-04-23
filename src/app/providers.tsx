"use client";

import ClientProviders from "@/providers/providers.client";
import { ThemeProvider } from "@/providers/theme-provider";
import { type Theme } from "@/shared/theme";

export function Providers({
  children,
  initialTheme,
  csrfToken,
  nonce,
}: Readonly<{
  children: React.ReactNode;
  initialTheme: Theme;
  csrfToken: string | null;
  nonce: string | null;
}>) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ClientProviders csrfToken={csrfToken} nonce={nonce}>
        {children}
      </ClientProviders>
    </ThemeProvider>
  );
}
