"use client";

import { useEffect } from "react";

import { normalizeError } from "@/shared/core/errors/normalize";
import { appLogger } from "@/shared/observability/logger/with-context.client";

export default function ErrorBoundary({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    appLogger.error("App Error", { error: normalizeError(error) });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-xl font-semibold">Something went wrong</h2>

      <button
        onClick={() => {
          reset();
        }}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Try again
      </button>
    </div>
  );
}
