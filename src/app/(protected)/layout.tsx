import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifySession } from "@/shared/security/session.server";

export default async function ProtectedLayout({ children }: { readonly children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  const payload = verifySession(session);
  const user = payload?.user;

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
