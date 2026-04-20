"use client";

import { useMemo } from "react";
import { Toaster } from "react-hot-toast";

import { useTheme } from "@/providers/theme-provider";
import { getToastOptions } from "@/shared/ui/toast/toast.config";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  const options = useMemo(() => getToastOptions(theme), [theme]);

  return (
    <>
      <Toaster position="top-right" gutter={8} containerStyle={{ zIndex: 9999 }} toastOptions={options} />
      {children}
    </>
  );
}
