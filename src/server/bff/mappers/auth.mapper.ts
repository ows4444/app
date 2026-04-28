import { type z } from "zod";

import { resolveAuthFlow } from "@/features/auth/model/auth.flow";

import { type loginApiResponseSchema } from "../contracts/auth.contract";

export function mapLoginResponse(api: z.infer<typeof loginApiResponseSchema>) {
  const flow = resolveAuthFlow(api.nextStep ? { nextStep: api.nextStep } : undefined);

  return {
    user: {
      id: api.user.id,
      name: api.user.full_name,
    },
    flow,
  };
}
