"use client";

import { useCallback, useContext } from "react";

import { type DotPaths } from "@/shared/lib/types/dot-paths";

import { I18nContext } from "./context";
import { type Messages } from "./types";

type MessageKeys = DotPaths<Messages>;

export function useT() {
  const messages = useContext(I18nContext);

  if (!messages) {
    throw new Error("useT must be used within I18nProvider");
  }

  return useCallback(
    (key: MessageKeys, params?: Record<string, string | number>) => {
      let value: unknown = messages;

      for (const part of key.split(".")) {
        if (value && typeof value === "object" && part in value) {
          value = (value as Record<string, unknown>)[part];
        } else {
          value = undefined;
          break;
        }
      }

      if (value == null || typeof value !== "string") {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`Missing translation: ${key}`);
        }

        return key;
      }

      if (params) {
        return Object.entries(params).reduce((acc, [k, v]) => acc.replace(`{${k}}`, String(v)), value);
      }

      return value;
    },
    [messages],
  );
}

export function useLocale() {
  const messages = useContext(I18nContext);
  return (messages as { __locale?: string }).__locale ?? "en";
}
