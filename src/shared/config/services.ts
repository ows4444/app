import { env } from "@/config/server/env";

export const SERVICES = {
  AUTH: env.AUTH_SERVICE_URL,
  API: env.API_SERVICE_URL,
} as const;

if (!SERVICES.AUTH || !SERVICES.API) {
  throw new Error("Missing required service URLs");
}
