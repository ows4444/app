import { getDashboardUser } from "@/widgets/dashboard/server/dashboard-user.dynamic";
import { DashboardWidget } from "@/widgets/dashboard/ui/dashboard.widget";

export default async function DashboardPage() {
  const user = await getDashboardUser();

  if (!user) return null;

  return <DashboardWidget {...user} />;
}
