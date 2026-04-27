import { type User } from "@/entities/user/model/types";

export function DashboardWidgetClient({ user }: Readonly<{ user: User }>) {
  return <div>{user.name}</div>;
}
