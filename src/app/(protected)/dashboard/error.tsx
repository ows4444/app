"use client";

import { useEffect } from "react";

import { appLogger } from "@/shared/observability/logger/with-context.client";

export default function DashboardError({ error, reset }: Readonly<{ error: Error; reset: () => void }>) {
  useEffect(() => {
    appLogger.error("DASHBOARD_ERROR", { error });
  }, [error]);

  return (
    <div className="p-4">
      <p className="text-red-500">Failed to load dashboard</p>
      <button onClick={reset} className="underline">
        Retry
      </button>
    </div>
  );
}
