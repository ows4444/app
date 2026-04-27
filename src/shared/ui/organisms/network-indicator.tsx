"use client";

import { onlineManager } from "@tanstack/react-query";
import { useEffect } from "react";

export function NetworkIndicator() {
  useEffect(() => {
    return onlineManager.subscribe((online) => {
      if (!online) {
        alert("You are offline. Please check your internet connection.");
      }
    });
  }, []);

  return null;
}
