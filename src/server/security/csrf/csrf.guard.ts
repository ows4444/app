import { cookies } from "next/headers";

import { HttpError } from "@/shared/core/errors";

import { decodeDeviceId } from "../device-id.server";
import { isSafeMethod, safeEqual } from "./csrf.core";
import { decode, verifyCsrf } from "./csrf.server";

export async function assertValidCsrf(req: Request) {
  if (isSafeMethod(req.method)) return;

  const cookieStore = await cookies();

  const csrfCookie = cookieStore.get("csrf")?.value;
  const deviceCookie = cookieStore.get("device_id")?.value;

  const header = req.headers.get("x-csrf-token");

  if (!csrfCookie || !deviceCookie || !header) {
    throw new HttpError(403, "CSRF_MISSING");
  }

  const payload = decode(csrfCookie);
  const deviceId = decodeDeviceId(deviceCookie);

  if (!payload || !verifyCsrf(csrfCookie) || !deviceId) {
    throw new HttpError(403, "CSRF_INVALID");
  }

  const now = Date.now();

  if (payload.exp < now) {
    throw new HttpError(403, "CSRF_EXPIRED");
  }

  if (payload.deviceId !== deviceId) {
    throw new HttpError(403, "DEVICE_MISMATCH");
  }

  if (!safeEqual(payload.token, header)) {
    throw new HttpError(403, "CSRF_TOKEN_MISMATCH");
  }
}
