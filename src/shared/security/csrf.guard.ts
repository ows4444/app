import { cookies, headers } from "next/headers";

import { CSRF_HEADER, timingSafeEqual } from "@/shared/security/csrf.core";

import { decode, verifyCsrf } from "./csrf.server";

export async function assertValidCsrf() {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const encoded = cookieStore.get("csrf")?.value;
  const header = headerStore.get(CSRF_HEADER);

  if (!encoded || !header) {
    throw new Error("CSRF_MISSING");
  }

  const valid = verifyCsrf(encoded);
  const payload = decode(encoded);

  if (!valid || !payload) {
    throw new Error("CSRF_INVALID");
  }

  const same = timingSafeEqual(payload.token, header);

  if (!same) {
    throw new Error("CSRF_TOKEN_MISMATCH");
  }
}
