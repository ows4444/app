import { z } from "zod";

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const userSchema = z.object({
  id: z.string(),
  full_name: z.string(),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type UserDTO = z.infer<typeof userSchema>;
