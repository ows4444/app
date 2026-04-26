"use client";

import dynamic from "next/dynamic";

import { clientEnv } from "@/config/client/env";

export const Devtools =
  clientEnv.NODE_ENV === "development"
    ? dynamic(() => import("@tanstack/react-query-devtools").then((m) => m.ReactQueryDevtools), { ssr: false })
    : () => null;
