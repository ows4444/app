import { Suspense } from "react";

import { getUser } from "@/features/auth/server/get-auth";

async function DashboardContent() {
  const user = await getUser();
  return <p>Welcome {user?.full_name}</p>;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p>Loading dashboard...</p>}>
      <DashboardContent />
    </Suspense>
  );
}
