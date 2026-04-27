import { Suspense } from "react";

import { type User } from "@/entities/user";

export default function Page({ children }: Readonly<{ children: (user: User) => React.ReactNode }>) {
  return <Suspense fallback={<div>Loading dashboard...</div>}>{children}</Suspense>;
}
