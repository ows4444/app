import { redirect } from "next/navigation";

import React from "react";

import { getUser } from "@/features/auth/server/get-auth";

export const runtime = "nodejs";

export default async function ProtectedLayout({ children }: { readonly children: React.ReactNode }) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
