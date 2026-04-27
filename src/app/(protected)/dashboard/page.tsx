import { DashboardWidget } from "@/widgets/dashboard/ui/dashboard.widget";

export default async function DashboardPage() {
  return <DashboardWidget {...{ id: "Id", name: "User Name" }} />;
}
