import { type NextRequest, NextResponse } from "next/server";

import { routeLogger } from "@/server/observability/logger/with-context.server";

import { normalizeErrorResponse } from "./normalize-error";

type Handler<T> = (req: NextRequest) => Promise<T> | T;

export function createQueryRoute<T>(handler: Handler<T>) {
  return async function GET(req: NextRequest): Promise<Response> {
    const start = Date.now();

    try {
      const data = await handler(req);

      return NextResponse.json(data);
    } catch (err) {
      routeLogger.error("QUERY_ROUTE_ERROR", {
        error: err,
        path: req.nextUrl.pathname,
        duration: Date.now() - start,
      });

      return normalizeErrorResponse(err);
    }
  };
}
