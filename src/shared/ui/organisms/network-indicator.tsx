"use client";

import { useNetworkStore } from "@/state/network.store";

export function NetworkIndicator() {
  const { isOnline, isSlow } = useNetworkStore();

  if (!isOnline) {
    return (
      <div className="fixed top-0 z-[9999] w-full bg-red-500 p-2 text-center text-white text-sm">You are offline</div>
    );
  }

  if (isSlow) {
    return (
      <div className="fixed top-0 z-[9999] w-full bg-yellow-500 p-2 text-center text-black text-sm">
        Network is slow...
      </div>
    );
  }

  return null;
}
