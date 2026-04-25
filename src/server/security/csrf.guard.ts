import { HttpError } from "@/shared/core/errors";
import { CSRF_HEADER, timingSafeEqual } from "./csrf.core";
import { decode, verifyCsrf } from "./csrf.server";
export function assertValidCsrf(req: Request) {
  const cookie = req.headers.get("cookie");
  const header = req.headers.get(CSRF_HEADER);
  const encoded = cookie
    ?.split("; ")
    .find((c) => c.startsWith("csrf="))
    ?.split("=")[1];
  if (!encoded) {
    throw new HttpError(403, "CSRF_COOKIE_MISSING");
  }
  if (!header) {
    throw new HttpError(403, "CSRF_HEADER_MISSING");
  }
  const valid = verifyCsrf(encoded);
  const payload = decode(encoded);
  if (!valid || !payload) {
    throw new HttpError(403, "CSRF_INVALID_OR_EXPIRED");
  }
  const same = timingSafeEqual(payload.token, header);
  if (!same) {
    throw new HttpError(403, "CSRF_TOKEN_MISMATCH");
  }
}
