"use client";

import { createErrorBoundary } from "@/shared/react/create-error-boundary";

const RootErrorBoundary = createErrorBoundary({ name: "Root" });

export function RootErrorBoundaryProvider({ children }: { children: React.ReactNode }) {
  return <RootErrorBoundary>{children}</RootErrorBoundary>;
}
