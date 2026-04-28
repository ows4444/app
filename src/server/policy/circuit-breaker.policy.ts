import { HttpError } from "@/shared/core/errors";

type State = "CLOSED" | "OPEN" | "HALF_OPEN";

type Options = {
  failureThreshold: number;
  resetTimeout: number;
};

export function createCircuitBreaker(name: string, opts: Options) {
  let state: State = "CLOSED";
  let failures = 0;
  let nextTry = 0;

  async function execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();

    if (state === "OPEN") {
      if (now < nextTry) {
        throw new HttpError(503, `${name.toUpperCase()}_SERVICE_UNAVAILABLE`);
      }

      state = "HALF_OPEN";
    }

    try {
      const result = await fn();

      failures = 0;
      state = "CLOSED";

      return result;
    } catch (err) {
      failures++;

      if (failures >= opts.failureThreshold) {
        state = "OPEN";
        nextTry = now + opts.resetTimeout;
      }

      throw err;
    }
  }

  return { execute };
}
