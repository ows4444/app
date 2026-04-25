import { Suspense } from "react";

import { getUser } from "@/features/auth/server/get-auth";

async function DashboardContent() {
  const user = await getUser();

  return <p>Welcome {user?.name}</p>;
}

export function DashboardWidget() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DashboardContent />
    </Suspense>
  );
}
