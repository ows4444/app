"use client";

import { useEffect, useState } from "react";

import { onlineManager } from "@tanstack/react-query";

export function NetworkIndicator() {
  const [isOnline, setIsOnline] = useState(onlineManager.isOnline());

  useEffect(() => {
    return onlineManager.subscribe(setIsOnline);
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-0 z-9999 w-full bg-red-500 p-2 text-center text-sm text-white">You are offline</div>
    );
  }

  return null;
}
