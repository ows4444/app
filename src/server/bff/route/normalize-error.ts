import { NextResponse } from "next/server";

import { HttpError } from "@/shared/core/errors";

export function normalizeErrorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: { code: err.message } }, { status: err.status });
  }

  return NextResponse.json({ error: { code: "INTERNAL_ERROR" } }, { status: 500 });
}
