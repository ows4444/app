"use client";

import { useEffect, useState } from "react";

import { notificationStore } from "../model/store";

function getNotificationClass(level: string) {
  switch (level) {
    case "success":
      return "bg-green-500 text-white";
    case "error":
      return "bg-red-500 text-white";
    case "warning":
      return "bg-yellow-500 text-black";
    default:
      return "bg-gray-800 text-white";
  }
}

export function NotificationRenderer() {
  const [notifications, setNotifications] = useState(notificationStore.getState());

  useEffect(() => {
    return notificationStore.subscribe(() => {
      setNotifications([...notificationStore.getState()]);
    });
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2" role="status" aria-live="polite">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`rounded-md px-4 py-2 text-sm shadow ${getNotificationClass(n.level)}`}
          onClick={() => {
            notificationStore.remove(n.id);
          }}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}
