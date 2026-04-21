"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import { useTheme } from "@/providers/theme-provider";
import { getToastOptions } from "@/shared/ui/toast/toast.config";

const Toaster = dynamic(() => import("react-hot-toast").then((m) => m.Toaster), { ssr: false });

export function ToastProvider({ children }: { readonly children: React.ReactNode }) {
  const { theme } = useTheme();

  const options = useMemo(() => getToastOptions(theme), [theme]);

  return (
    <>
      <Toaster position="top-right" gutter={8} containerStyle={{ zIndex: 9999 }} toastOptions={options} />
      {children}
    </>
  );
}
