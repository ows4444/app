"use client";

import { I18nContext } from "@/shared/i18n/context";
import { type Messages } from "@/shared/i18n/types";

export function I18nProvider({ messages, children }: { messages: Messages; children: React.ReactNode }) {
  return <I18nContext.Provider value={messages}>{children}</I18nContext.Provider>;
}
