import { type NextRequest } from "next/server";
import { env } from "@/config/env";

const API_URL = env.API_URL;

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Only proxy API requests
  if (!pathname.startsWith("/api")) {
    return;
  }

  const target = new URL(pathname.replace("/api", "") + search, API_URL);

  try {
    const headers = new Headers(req.headers);

    headers.delete("host");
    headers.delete("connection");
    headers.delete("content-length");

    const init: RequestInit & { duplex?: "half" } = {
      method: req.method,
      headers,
      body:
        req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.duplex = "half";
    }

    return fetch(target, init);
  } catch {
    return new Response("Upstream error", { status: 502 });
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
