import { env } from "@/config/server/env";

export const Devtools =
  env.NODE_ENV === "development"
    ? (await import("./react-query-devtools.dev")).Devtools
    : (await import("./react-query-devtools.prod")).Devtools;
