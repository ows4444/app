import { serviceClient } from "@/server/http/upstream.client";
import { HttpError } from "@/shared/core/errors";
export async function getUser() {
  try {
    const res = await serviceClient<{ user: { id: string; full_name: string } }>("AUTH", "/auth/me", {
      method: "GET",
    });
    return res.data.user ?? null;
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      return null;
    }
    throw err;
  }
}
