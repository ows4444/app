"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect } from "react";

import { ScreenLoader } from "@/shared/ui/organisms/screen-loader";
import { useNetworkStore } from "@/state/network.store";

export function UIProvider({ children }: { children: React.ReactNode }) {
  const isFetching = useIsFetching({
    predicate: (query) => query.options.meta?.priority === "high",
  });

  const isMutating = useIsMutating({
    predicate: (mutation) => mutation.options.meta?.priority === "high",
  });

  const { isOnline, isSlow, setFetching, setMutating } = useNetworkStore();

  useEffect(() => {
    setFetching(isFetching);
  }, [isFetching, setFetching]);

  useEffect(() => {
    setMutating(isMutating);
  }, [isMutating, setMutating]);

  const isBlocking = (isFetching > 0 || isMutating > 0) && isOnline && !isSlow;

  return (
    <>
      <ScreenLoader isLoading={isBlocking} />
      {children}
    </>
  );
}
