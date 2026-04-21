"use server";

import { assertValidCsrf } from "./csrf.guard";

export async function withCsrfAction<T extends (...args: unknown[]) => Promise<unknown>>(fn: T): Promise<T> {
  return (async (...args: Parameters<T>) => {
    await assertValidCsrf();

    return fn(...args);
  }) as unknown as Promise<T>;
}
