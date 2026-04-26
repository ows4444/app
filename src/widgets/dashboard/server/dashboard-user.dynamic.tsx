import { getUser } from "@/server/auth/get-auth";

export async function GetDashboardUser() {
  return getUser();
}
