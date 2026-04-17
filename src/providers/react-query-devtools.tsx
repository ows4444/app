"use client";

import dynamic from "next/dynamic";

export const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools))
    : () => null;
