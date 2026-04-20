"use server";

import { assertValidCsrf } from "./csrf.guard";

export function withCsrfAction<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: Parameters<T>) => {
    await assertValidCsrf();

    return fn(...args);
  }) as T;
}
