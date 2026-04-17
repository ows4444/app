import { onlineManager } from "@tanstack/react-query";

import { networkEvents } from "../network-events";

if (typeof window !== "undefined") {
  onlineManager.setEventListener((setOnline) => {
    const update = () => {
      const online = navigator.onLine;

      setOnline(online);
      networkEvents.online.emit(online);
    };

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  });
}
