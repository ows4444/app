import { THEME_STORAGE_KEY } from "./theme.constants";
import { type Theme } from "./theme.types";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
}

export function setStoredTheme(theme: Theme) {
  if (typeof document === "undefined") return;

  localStorage.setItem(THEME_STORAGE_KEY, theme);

  document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}
