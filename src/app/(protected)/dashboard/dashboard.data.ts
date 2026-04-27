import { getMe } from "@/shared/api/server/get-me";
import { serviceClient } from "@/shared/api/server/service-client";

export async function getDashboardData() {
  const [user, stats] = await Promise.all([getMe(), serviceClient("/stats", { service: "API", cache: "no-store" })]);

  return { user, stats };
}
