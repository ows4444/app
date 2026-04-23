import { cookies } from "next/headers";

import { verifySession } from "@/shared/security/session.server";
import { createQuery } from "@/shared/server/route/create-route";

export const runtime = "nodejs";

function getUserFromSession(session?: string) {
  try {
    if (!session) return null;

    const payload = verifySession(session);
    const user = payload?.user ?? null;
    return user;
  } catch {
    return null;
  }
}

export const GET = createQuery(async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  const user = getUserFromSession(session);

  if (!user) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  return Response.json({
    data: {
      user: {
        id: user.id,
        full_name: user.name,
      },
    },
  });
});
