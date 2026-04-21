"use client";

import { useEffect, useState } from "react";

export function NetworkIndicator() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;

    return navigator.onLine;
  });

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    const update = () => {
      setIsOnline(navigator.onLine);
    };

    update();

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-0 z-[9999] w-full bg-red-500 p-2 text-center text-sm text-white">You are offline</div>
    );
  }

  return null;
}
