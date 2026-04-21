"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { createQueryClient } from "@/shared/infra/react-query/get-query-client";

export function QueryProvider({ children }: { readonly children: React.ReactNode }) {
  const [client] = useState(() => createQueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
