import { cookies } from "next/headers";
import "server-only";

import { normalizeError } from "@/shared/core/errors/normalize";
import { apiClient } from "@/shared/infrastructure/api-client/api-client.server";
import { withContext } from "@/shared/infrastructure/logger/with-context.server";
import { getServerRequestContext } from "@/shared/request/request-context.server";

import { mapUser } from "../mappers/user.mapper";
import { type UserDTO } from "../types";

export async function getSession(locale?: string) {
  const ctx = await getServerRequestContext();

  const log = withContext({
    ...ctx,
    scope: "auth:getSession",
  });

  try {
    log.info("Fetching session");

    const cookieStore = await cookies();

    const dto = await apiClient<UserDTO>("/auth/me", {
      headers: {
        Cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
        ...(locale != null ? { "Accept-Language": locale } : {}),
      },
      cache: "no-store",
    });

    log.info("Session fetched", { userId: dto.id });

    return mapUser(dto);
  } catch (err) {
    log.error("Session fetch failed", { error: normalizeError(err) });

    return null;
  }
}
