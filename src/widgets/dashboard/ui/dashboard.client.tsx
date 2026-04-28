"use client";

import { type User } from "@/entities/user";

export function DashboardClient({ user }: Readonly<{ user: User }>) {
  return <div>{user.name}</div>;
}
