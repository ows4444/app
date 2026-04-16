"use client";

import { createContext, useCallback, useContext } from "react";

import { type Messages } from "@/shared/lib/i18n/types";
import { type DotPaths } from "@/shared/lib/types/dot-paths";

const I18nContext = createContext<Messages>({} as Messages);

export function I18nProvider({ messages, children }: { messages: Messages; children: React.ReactNode }) {
  return <I18nContext.Provider value={messages}>{children}</I18nContext.Provider>;
}

type MessageKeys = DotPaths<Messages>;

export function useT() {
  const messages = useContext(I18nContext);

  return useCallback(
    (key: MessageKeys) => {
      const value = key.split(".").reduce<unknown>((acc, part) => {
        if (acc && typeof acc === "object" && part in acc) {
          return (acc as Record<string, unknown>)[part];
        }

        return undefined;
      }, messages);

      if (value == null || typeof value !== "string") {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`Missing translation: ${key}`);
        }

        return key;
      }

      return value;
    },
    [messages],
  );
}
