import { env } from "@/config/env";

/* eslint-disable @typescript-eslint/no-require-imports */
export const Devtools =
  env.NODE_ENV === "development"
    ? require("./react-query-devtools.dev").Devtools
    : require("./react-query-devtools.prod").Devtools;
