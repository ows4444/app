export type Theme = "light" | "dark" | "system";

export type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const THEME_STORAGE_KEY = "theme";

export const DEFAULT_THEME: Theme = "light";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
}

export function setStoredTheme(theme: Theme) {
  if (typeof document === "undefined") return;

  localStorage.setItem(THEME_STORAGE_KEY, theme);

  document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}

export function applyThemeToDOM(theme: Theme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  const resolved = theme === "system" ? getSystemTheme() : theme;

  if (resolved === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getPreferredTheme(): Theme {
  const stored = getStoredTheme();
  if (stored) return stored;

  return getSystemTheme();
}
