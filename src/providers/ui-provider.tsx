"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";

import { ScreenLoader } from "@/shared/ui/organisms/screen-loader";

export function UIProvider({ children }: { children: React.ReactNode }) {
  const isFetching = useIsFetching({
    predicate: (query) => query.options.meta?.blocking === true,
  });

  const isMutating = useIsMutating({
    predicate: (mutation) => mutation.options.meta?.blocking === true,
  });

  const isBlocking = isFetching > 0 || isMutating > 0;

  return (
    <>
      <ScreenLoader isLoading={isBlocking} />
      {children}
    </>
  );
}
