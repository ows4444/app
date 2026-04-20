"use client";

import dynamic from "next/dynamic";

export const ReactQueryDevtools = dynamic(
  () =>
    process.env.NODE_ENV === "development"
      ? import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools)
      : Promise.resolve(() => null),
  {
    ssr: false,
    loading: () => null,
  },
);
