"use client";

import { useT } from "@/shared/lib/i18n/client";

export default function Home() {
  const t = useT();

  return <div>{t("common.ok")}</div>;
}
