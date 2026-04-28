"use client";

import { onlineManager } from "@tanstack/react-query";
import { useEffect } from "react";

import { uiLogger } from "@/shared/observability/logger/with-context.client";

export function NetworkIndicator() {
  useEffect(() => {
    return onlineManager.subscribe((online) => {
      if (!online) {
        uiLogger.warn("OFFLINE");
      }
    });
  }, []);

  return null;
}
