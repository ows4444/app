import { NextResponse } from "next/server";

import { appLogger } from "@/server/observability/logger/with-context.server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    appLogger.warn("CSP_VIOLATION", {
      violation: body,
      type: "csp",
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
