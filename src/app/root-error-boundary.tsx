"use client";

import { createErrorBoundary } from "@/shared/core/error-boundary/create-error-boundary";

const RootErrorBoundary = createErrorBoundary({ name: "Root" });

export function RootErrorBoundaryProvider({ children }: { readonly children: React.ReactNode }) {
  return <RootErrorBoundary>{children}</RootErrorBoundary>;
}
