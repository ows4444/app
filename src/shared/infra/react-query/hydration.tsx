"use client";

import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";

export function HydrateClient({ state, children }: Readonly<{ state: DehydratedState; children: React.ReactNode }>) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
