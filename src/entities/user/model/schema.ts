import { z } from "zod";

export const apiUserSchema = z.object({
  id: z.string(),
  full_name: z.string(),
});

export type ApiUser = z.infer<typeof apiUserSchema>;
