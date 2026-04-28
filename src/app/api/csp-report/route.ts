import { NextResponse } from "next/server";
import { z } from "zod";

import { appLogger } from "@/server/observability/logger/with-context.server";

const schema = z.object({
  "csp-report": z.object({
    "document-uri": z.string().optional(),
    "violated-directive": z.string().optional(),
    "blocked-uri": z.string().optional(),
  }),
});

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const json = JSON.parse(text);
    const body = schema.parse(json);

    appLogger.warn("CSP_VIOLATION", {
      violation: body,
      type: "csp",
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}

export const runtime = "nodejs";
