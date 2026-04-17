"use client";

import "@/app/i18n-init";
import { useEffect } from "react";

import { withContext } from "@/shared/lib/infra/logger/with-context.client";

const log = withContext({ scope: "app:error-boundary" });

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    log.error("App Error", { error });
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
