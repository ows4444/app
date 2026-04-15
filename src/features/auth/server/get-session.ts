import { cookies } from "next/headers";
import { serverFetch } from "@/shared/lib/fetch.server";
import { mapUser } from "../mappers/user.mapper";
import type { UserDTO } from "../types";

export async function getSession() {
  try {
    const dto = await serverFetch<UserDTO>("/auth/me", {
      headers: {
        Cookie: cookies().toString(),
      },
    });

    return mapUser(dto);
  } catch {
    return null;
  }
}
