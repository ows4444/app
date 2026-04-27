import { z } from "zod";

export const loginRequestSchema = z.object({
  identifier: z.string(),
});

export const loginApiResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    full_name: z.string(),
  }),
  nextStep: z.string().optional(),
});

export const loginResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
  }),
  nextStep: z.string().nullable(),
});
