import type { DefaultToastOptions } from "react-hot-toast";

export function getToastOptions(theme: "light" | "dark"): DefaultToastOptions {
  const isDark = theme === "dark";

  const baseStyle = {
    background: isDark ? "#1e293b" : "#ffffff",
    color: isDark ? "#f1f5f9" : "#0f172a",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    padding: "16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: isDark
      ? "0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.2)"
      : "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  };

  return {
    duration: 4000,
    style: baseStyle,

    success: {
      duration: 3000,
      iconTheme: {
        primary: "#3b82f6",
        secondary: "#ffffff",
      },
      style: {
        ...baseStyle,
        border: "1px solid #3b82f6",
      },
    },

    error: {
      duration: 4000,
      iconTheme: {
        primary: "#ef4444",
        secondary: "#ffffff",
      },
      style: {
        ...baseStyle,
        border: "1px solid #ef4444",
      },
    },

    loading: {
      iconTheme: {
        primary: "#3b82f6",
        secondary: "#ffffff",
      },
    },
  };
}
