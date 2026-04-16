"use client";

import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { UIProvider } from "@/providers/ui-provider";
import { Messages } from "@/shared/lib/i18n/types";
import { I18nProvider } from "@/providers/i18n-provider";

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
