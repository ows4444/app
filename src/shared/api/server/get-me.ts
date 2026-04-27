import "server-only";

import { type User } from "@/entities/user";
import { serviceClient } from "@/shared/api/server/service-client";

export async function getMe(): Promise<User> {
  return serviceClient<User>("/auth/me", {
    service: "AUTH",
    cache: "no-store",
  });
}
