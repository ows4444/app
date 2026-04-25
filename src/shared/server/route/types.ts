import { type NextRequest } from "next/server";

export type AppRouteHandler<TParams = unknown> = (
  req: NextRequest,
  ctx: { params: Promise<TParams> },
) => Promise<Response> | Response;

export type MutationHandler<TCtx = unknown> = AppRouteHandler<TCtx>;
export type QueryHandler<TCtx = unknown> = AppRouteHandler<TCtx>;
