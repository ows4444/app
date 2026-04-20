import { type z } from "zod";

export async function requestWithSchema<T>(promise: Promise<unknown>, schema: z.ZodType<T>): Promise<T> {
  const res = await promise;
  return schema.parse(res);
}
