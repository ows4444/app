"use client";

import { useEffect, useRef } from "react";
import { toastService } from "@/shared/lib/toast/toast.service";
import { NetworkError, TimeoutError, SessionExpiredError } from "@/shared/lib/errors";

export function useQueryEffects(error: unknown) {
  const shownRef = useRef(false);
  useEffect(() => {
    if (!error) return;
    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
    if (isOffline && !shownRef.current) {
      toastService.networkError();
      shownRef.current = true;
    } else {
      if (error instanceof NetworkError) {
        toastService.networkError();
        return;
      }

      if (error instanceof TimeoutError) {
        toastService.error("Request timed out");
        return;
      }

      if (error instanceof SessionExpiredError) {
        return;
      }

      toastService.error("Something went wrong");
    }
  }, [error]);
}
