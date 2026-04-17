import { cookies } from "next/headers";
import { cache } from "react";

import { normalizeError } from "@/shared/lib/errors/normalize";
import { apiClient } from "@/shared/lib/infra/api-client";
import { withContext } from "@/shared/lib/infra/logger/with-context.server";
import { getRequestContext } from "@/shared/lib/request-context/request-context.server";

import { mapUser } from "../mappers/user.mapper";
import { type UserDTO } from "../types";

export const getSession = cache(async (locale?: string) => {
  const ctx = await getRequestContext();

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
    });

    log.info("Session fetched", { userId: dto.id });

    return mapUser(dto);
  } catch (err) {
    log.error("Session fetch failed", { error: normalizeError(err) });

    return null;
  }
});
