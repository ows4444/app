import React from "react";

export const runtime = "nodejs";

export default async function ProtectedLayout({ children }: { readonly children: React.ReactNode }) {
  return <>{children}</>;
}
