import { cookies } from "next/headers";

import { createMutation } from "@/shared/server/route/create-route";

export const runtime = "nodejs";

export const POST = createMutation(async () => {
  const cookieStore = await cookies();

  cookieStore.set("session", "", {
    path: "/",
    maxAge: 0,
  });

  return Response.json({ data: true });
});
