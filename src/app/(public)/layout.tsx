import { redirect } from "next/navigation";

import { getUser } from "@/features/auth/server/get-auth";

export default async function PublicLayout({ children }: { readonly children: React.ReactNode }) {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
