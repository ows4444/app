"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { setStoredTheme, type Theme, type ThemeContextValue } from "@/shared/theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  initialTheme,
}: Readonly<{ children: React.ReactNode; initialTheme: Theme }>) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  function resolveTheme(value: Theme): "light" | "dark" {
    if (value === "system") {
      if (typeof window === "undefined") return "light";

      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    return value;
  }

  useEffect(() => {
    const resolved = resolveTheme(theme);
    const root = document.documentElement;

    const isDark = root.classList.contains("dark");
    const shouldBeDark = resolved === "dark";

    if (isDark !== shouldBeDark) {
      root.classList.toggle("dark", shouldBeDark);
    }

    setStoredTheme(theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;

    const apply = (value: Theme) => {
      const resolved = resolveTheme(value);

      root.classList.toggle("dark", resolved === "dark");
    };

    apply(theme);
    setStoredTheme(theme);

    if (theme !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = () => {
      apply("system");
    };

    media.addEventListener("change", handler);

    return () => {
      media.removeEventListener("change", handler);
    };
  }, [theme]);

  const setTheme = useCallback((value: Theme) => {
    setThemeState(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const resolved = resolveTheme(prev);
      return resolved === "light" ? "dark" : "light";
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");

  return ctx;
}
