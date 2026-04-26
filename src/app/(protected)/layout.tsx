import React from "react";

export const runtime = "nodejs";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
