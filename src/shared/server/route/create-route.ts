import { NextResponse } from "next/server";

import { isSafeMethod } from "@/shared/security/csrf.core";
import { assertValidCsrf } from "@/shared/security/csrf.guard";
import { decode, generateCsrfToken } from "@/shared/security/csrf.server";

import { type AppRouteHandler } from "./types";

// ─────────────────────────────────────────────
// 🔒 MUTATION (CSRF ENFORCED ALWAYS)
// ─────────────────────────────────────────────
export function createMutation(handler: AppRouteHandler): AppRouteHandler {
  return async (req, ctx) => {
    if (!isSafeMethod(req.method)) {
      try {
        await assertValidCsrf(); // ✅ SINGLE SOURCE OF TRUTH
      } catch {
        return NextResponse.json({ error: "CSRF_VALIDATION_FAILED" }, { status: 403 });
      }
    }

    const res = await handler(req, ctx);

    // 🔁 rotate token after every mutation

    const encoded = generateCsrfToken();
    const payload = decode(encoded);

    const next = NextResponse.from(res);

    if (payload) {
      // httpOnly signed payload
      next.cookies.set("csrf", encoded, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      // readable token for header
      next.cookies.set("csrf_token", payload.token, {
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    } else {
      // fallback safety (should never happen)
      return NextResponse.json({ error: "CSRF_ROTATION_FAILED" }, { status: 500 });
    }

    return next;
  };
}

// ─────────────────────────────────────────────
// 🌐 QUERY (SAFE)
// ─────────────────────────────────────────────
export function createQuery(handler: AppRouteHandler): AppRouteHandler {
  return handler;
}
