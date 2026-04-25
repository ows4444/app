import { mapApiUserToDomain } from "@/entities/user/model/mapper";
import { apiUserSchema } from "@/entities/user/model/schema";
import { CacheTags } from "@/server/cache/tags";
import { serviceClient } from "@/server/http/upstream.client";
import { HttpError } from "@/shared/core/errors";

async function getUserImpl() {
  try {
    const res = await serviceClient<{ user: { id: string; full_name: string } }>("AUTH", "/auth/me", {
      method: "GET",
      tags: [CacheTags.auth()],
    });

    if (!res.data?.user) return null;

    const parsed = apiUserSchema.safeParse(res.data.user);

    if (!parsed.success) {
      throw new Error("Invalid user payload from AUTH service");
    }

    return mapApiUserToDomain(parsed.data);
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      return null;
    }

    throw err;
  }
}

export const getUser = getUserImpl;
