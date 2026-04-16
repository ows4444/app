"use client";

import { AuthProvider } from "@/providers/auth-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { UIProvider } from "@/providers/ui-provider";
import { type Messages } from "@/shared/lib/i18n/types";

export function Providers({ children, messages }: { children: React.ReactNode; messages: Messages }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <UIProvider>
            <ToastProvider>
              <I18nProvider messages={messages}>{children}</I18nProvider>
            </ToastProvider>
          </UIProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
