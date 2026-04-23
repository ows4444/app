import { redirect } from "next/navigation";

import { Suspense } from "react";

import { getUser } from "@/shared/server/auth/get-user";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Suspense fallback={<p> suspense </p>}>
        <p>dashboard page</p>
      </Suspense>
    </>
  );
}
