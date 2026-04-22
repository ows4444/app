import { cookies } from "next/headers";

import { verifySession } from "@/shared/security/session.server";

export async function getUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  const payload = verifySession(session);

  return payload?.user ?? null;
}
