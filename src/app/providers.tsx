"use client";

import { memo } from "react";

import { AuthProvider } from "@/providers/auth-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ReactQueryDevtools } from "@/providers/react-query-devtools";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { UIProvider } from "@/providers/ui-provider";
import { type Messages } from "@/shared/i18n/types";
import { NetworkIndicator } from "@/shared/ui/organisms/network-indicator";

function ProvidersImpl({
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
      <I18nProvider messages={messages}>
        <QueryProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <AuthProvider>
            <UIProvider>
              <ToastProvider>
                <NetworkIndicator />
                {children}
              </ToastProvider>
            </UIProvider>
          </AuthProvider>
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export const Providers = memo(ProvidersImpl);
