import { redirect } from "next/navigation";

import { getUser } from "@/server/auth/get-auth";

export default async function PublicLayout({ children }: { readonly children: React.ReactNode }) {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
