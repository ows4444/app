"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";

import { applyThemeToDOM, getSystemTheme } from "@/shared/lib/theme/theme.dom";
import { getStoredTheme, setStoredTheme } from "@/shared/lib/theme/theme.storage";
import { type Theme, type ThemeContextValue } from "@/shared/lib/theme/theme.types";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => resolveInitialTheme());

  useLayoutEffect(() => {
    applyThemeToDOM(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setStoredTheme(theme);
    applyThemeToDOM(theme);
  }, [theme]);

  const setTheme = (value: Theme) => {
    setThemeState(value);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");

  return ctx;
}
