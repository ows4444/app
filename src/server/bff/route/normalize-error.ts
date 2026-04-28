import { NextResponse } from "next/server";

import { HttpError } from "@/shared/core/errors";

export function normalizeErrorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    const res = NextResponse.json({ error: { code: "HTTP_ERROR", message: err.message } }, { status: err.status });

    if (err.message === "CSRF_INVALID") {
      res.headers.set("x-error-code", "CSRF_INVALID");
    }

    return res;
  }

  return NextResponse.json({ error: { code: "INTERNAL_ERROR" } }, { status: 500 });
}
