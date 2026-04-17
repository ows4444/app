"use client";

import { AuthProvider } from "@/providers/auth-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ReactQueryDevtools } from "@/providers/react-query-devtools";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { UIProvider } from "@/providers/ui-provider";
import { type Messages } from "@/shared/lib/i18n/types";
import "@/shared/lib/infra/react-query/online-manager";
import { NetworkIndicator } from "@/shared/ui/organisms/network-indicator";

export function Providers({
  children,
  messages,
  initialTheme,
}: {
  children: React.ReactNode;
  messages: Messages;
  initialTheme: "light" | "dark";
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <QueryProvider>
        <ReactQueryDevtools initialIsOpen={false} />
        <I18nProvider messages={messages}>
          <AuthProvider>
            <UIProvider>
              <ToastProvider>
                <NetworkIndicator />
                {children}
              </ToastProvider>
            </UIProvider>
          </AuthProvider>
        </I18nProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
