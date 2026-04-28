import "server-only";
import { revalidateTag } from "next/cache";

import { type CacheTag } from "@/shared/cache/tags";

type CacheLifeConfig = {
  expire?: number;
};

export function invalidateTag(tag: CacheTag, config: CacheLifeConfig | "max" | "default" = "default") {
  revalidateTag(tag, config);
}
