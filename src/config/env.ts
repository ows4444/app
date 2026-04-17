import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
  server: {
    API_URL: z.string().url(),
  },
  client: {
    NEXT_PUBLIC_APP_NAME: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    API_URL: process.env.API_URL,
  },
  skipValidation: false,
});
