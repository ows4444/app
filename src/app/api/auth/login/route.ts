import { cookies, headers } from "next/headers";

import { z } from "zod";

import { serviceClient } from "@/shared/infra/service-client/service-client";
import { createSession } from "@/shared/security/session.server";
import { createMutation } from "@/shared/server/route/create-route";

const loginSchema = z.object({
  identifier: z.union([z.email(), z.string().regex(/^9715\d{8}$/)], {
    error: () => ({ message: "Must be a valid email or UAE phone number starting with 9715" }),
  }),
});

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const POST = createMutation(async (req) => {
  const body = await req.json();

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const headerStore = await headers();

  const upstream = await serviceClient<unknown>("AUTH", "/auth/login", {
    method: "POST",
    body: JSON.stringify(parsed.data),
    headers: {
      "x-request-id": headerStore.get("x-request-id") ?? "",
      "x-csrf-token": headerStore.get("x-csrf-token") ?? "",
      cookie: headerStore.get("cookie") ?? "",
    },
  });

  const raw = upstream;

  const userParsed = userSchema.safeParse(raw);

  if (!userParsed.success) {
    return Response.json({ error: "INVALID_AUTH_RESPONSE" }, { status: 500 });
  }

  const user = userParsed.data;

  const session = createSession({
    id: user.id,
    name: user.name,
  });

  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // ✅ 24h
  });

  return Response.json({
    data: {
      user: {
        id: user.id,
        full_name: user.name,
      },
    },
    meta: {
      nextStep: "authenticated",
    },
  });
});
