import { loginInputSchema, userSchema } from "@/features/auth/api/contract";
import { createEndpoint } from "@/shared/api/create-endpoint";

export const authApi = {
  login: createEndpoint({
    path: "/auth/login",
    method: "POST",
    input: loginInputSchema,
    output: userSchema,
  }),

  me: createEndpoint({
    path: "/auth/me",
    output: userSchema,

    cache: "force-cache",
    dedupeTTL: 5000,

    tags: ["auth"],
    priority: "high",
  }),
};
