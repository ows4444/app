"use client";
// using `use client` TODO: remove this when we have a better solution for i18n in server components

import { useT } from "@/shared/lib/i18n/client";

export default function Home() {
  const t = useT();

  return <div>{t("common.ok")}</div>;
}
