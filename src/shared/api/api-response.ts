import { z } from "zod";

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    error: z.string().optional(),
  });

export type ApiResponse<T> = {
  data: T;
  error?: string;
};
