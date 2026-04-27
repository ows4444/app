import { env } from "@/config/server/env";
import { HttpError } from "@/shared/core/errors";

export function validateOrigin(req: Request) {
  const origin = req.headers.get("origin");

  if (!origin) {
    if (req.method === "GET") return;

    throw new HttpError(403, "ORIGIN_MISSING");
  }

  const allowed = new URL(env.NEXT_PUBLIC_APP_URL).origin;

  if (origin !== allowed) {
    throw new HttpError(403, "ORIGIN_INVALID");
  }
}
