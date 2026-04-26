import { type User } from "@/entities/user";

export function DashboardWidget({ name }: Readonly<User>) {
  return <div>{name}</div>;
}
