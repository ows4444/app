"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";

import { ScreenLoader } from "@/shared/ui/organisms/screen-loader";

export function UIProvider({ children }: { readonly children: React.ReactNode }) {
  const isFetching = useIsFetching({
    predicate: (query) => query.meta?.blocking === true,
  });

  const isMutating = useIsMutating({
    predicate: (mutation) => mutation.meta?.blocking === true,
  });

  const isBlocking = isFetching > 0 || isMutating > 0;

  return (
    <>
      <ScreenLoader isLoading={isBlocking} />
      {children}
    </>
  );
}
