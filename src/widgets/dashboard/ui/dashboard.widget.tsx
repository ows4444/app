import React, { Suspense } from "react";

import { getUser } from "@/server/auth/get-auth";

async function UserSection() {
  const user = await getUser();
  return <p>Welcome {user?.name}</p>;
}

export function DashboardWidget() {
  return (
    <React.Fragment>
      <Suspense fallback={<p>Loading...</p>}>
        <UserSection />
      </Suspense>
    </React.Fragment>
  );
}
