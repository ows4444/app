"use client";

import { memo } from "react";

import { CsrfProvider } from "@/providers/csrf-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Devtools } from "@/providers/react-query-devtools";
import { ToastProvider } from "@/providers/toast-provider";
import { UIProvider } from "@/providers/ui-provider";
import { NetworkIndicator } from "@/shared/ui/organisms/network-indicator";

export function ClientProviders({
  children,
  csrfToken,
}: Readonly<{ children: React.ReactNode; csrfToken: string | null }>) {
  return (
    <QueryProvider>
      <CsrfProvider token={csrfToken}>
        <UIProvider>
          <ToastProvider>
            <NetworkIndicator />
            {children}
          </ToastProvider>
        </UIProvider>
      </CsrfProvider>
      <Devtools />
    </QueryProvider>
  );
}

export default memo(ClientProviders);
