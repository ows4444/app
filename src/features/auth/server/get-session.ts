import { cookies } from "next/headers";

import { env } from "@/config/env";
import { normalizeError } from "@/shared/lib/errors/normalize";
import { serverFetch } from "@/shared/lib/fetch.server";
import { withContext } from "@/shared/lib/infra/logger/with-context";
import { getRequestContext } from "@/shared/lib/request-context";

import { mapUser } from "../mappers/user.mapper";
import { type UserDTO } from "../types";

export async function getSession(locale?: string) {
  const ctx = await getRequestContext();

  const log = withContext(ctx);

  try {
    log.info("Fetching session");

    const cookieStore = await cookies();

    const dto = await serverFetch<UserDTO>(new URL("/auth/me", env.API_URL).toString(), {
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
}
