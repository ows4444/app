"use client";

import { memo } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { UIProvider } from "@/providers/ui-provider";
import { NetworkIndicator } from "@/shared/ui/organisms/network-indicator";
import { NotificationRenderer } from "@/features/notifications/ui/notification-renderer";

export function ClientProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryProvider>
      <UIProvider>{children}</UIProvider>

      <NetworkIndicator />
      <NotificationRenderer />
    </QueryProvider>
  );
}

export default memo(ClientProviders);
