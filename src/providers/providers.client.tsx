"use client";

import { memo } from "react";

import { CsrfProvider } from "@/providers/csrf-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { UIProvider } from "@/providers/ui-provider";
import { NetworkIndicator } from "@/shared/ui/organisms/network-indicator";

export function ClientProviders({
  children,
  csrfToken,
}: Readonly<{ children: React.ReactNode; csrfToken: string | null; nonce: string | null }>) {
  return (
    <QueryProvider>
      <CsrfProvider token={csrfToken}>
        <UIProvider>{children}</UIProvider>
        <ToastProvider />
        <NetworkIndicator />
      </CsrfProvider>
    </QueryProvider>
  );
}

export default memo(ClientProviders);
