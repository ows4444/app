import { use } from "react";

import { type getDashboardData } from "./dashboard.data";

import { DashboardWidget } from "@/widgets/dashboard";

export function Dashboard({ data }: Readonly<{ data: ReturnType<typeof getDashboardData> }>) {
  const resolved = use(data);

  return (
    <>
      <DashboardWidget user={resolved.user} />
      {/* future widgets */}
    </>
  );
}
