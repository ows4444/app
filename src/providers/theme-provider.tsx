"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { getCookie } from "@/shared/lib/cookies";
import { applyThemeToDOM } from "@/shared/lib/theme/theme.dom";
import { getStoredTheme, setStoredTheme } from "@/shared/lib/theme/theme.storage";
import { type Theme, type ThemeContextValue } from "@/shared/lib/theme/theme.types";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveInitialTheme(): Theme {
  const cookieTheme = getCookie<Theme>("theme");

  return cookieTheme ?? "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";

    return resolveInitialTheme();
  });

  useEffect(() => {
    setStoredTheme(theme);
    applyThemeToDOM(theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = () => {
      if (!getStoredTheme()) {
        setThemeState(media.matches ? "dark" : "light");
      }
    };

    media.addEventListener("change", handler);

    return () => {
      media.removeEventListener("change", handler);
    };
  }, []);

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
