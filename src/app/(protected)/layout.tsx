import React from "react";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
