import { getUser } from "@/server/auth/get-auth";

export async function getUserDynamic() {
  return getUser();
}
