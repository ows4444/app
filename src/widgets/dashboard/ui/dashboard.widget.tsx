import { type User } from "@/entities/user";

import { DashboardWidgetClient } from "./dashboard-widget.client";

export function DashboardWidget({ user }: Readonly<{ user: User }>) {
  return <DashboardWidgetClient user={user} />;
}
