"use client";

import { useT } from "@/providers/i18n-provider";

export default function Home() {
  const t = useT();

  return <div>{t("common.ok")}</div>;
}
