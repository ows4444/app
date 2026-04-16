"use client";

import { ScreenLoader } from "@/shared/ui/organisms/screen-loader";
import { useUIStore } from "@/state/ui.store";

export function UIProvider({ children }: { children: React.ReactNode }) {
  const isLoading = useUIStore((s) => s.isGlobalLoading);

  return (
    <>
      <ScreenLoader isLoading={isLoading} />
      {children}
    </>
  );
}
