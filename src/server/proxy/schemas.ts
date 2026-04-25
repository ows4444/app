import { z } from "zod";

export const proxySchemas: Record<string, z.ZodTypeAny | null> = {
  auth: z.object({
    identifier: z.string().min(3),
  }),

  users: null,
};
