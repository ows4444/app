"use client";

import { useEffect } from "react";

import { NotificationRenderer } from "@/features/notifications/ui/notification-renderer";
import { QueryProvider } from "@/providers/query-provider";
import { UIProvider } from "@/providers/ui-provider";
import { NetworkIndicator } from "@/shared/ui/organisms/network-indicator";

export function ClientProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    (async () => {
      try {
        await fetch("/api/auth/csrf", { credentials: "include" });
      } catch {}
    })();

    return () => {};
  }, []);

  return (
    <QueryProvider>
      <UIProvider>{children}</UIProvider>
      <NetworkIndicator />
      <NotificationRenderer />
    </QueryProvider>
  );
}

export default ClientProviders;
