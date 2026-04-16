import { TimeoutError } from "@/shared/lib/errors";
import { sleep } from "./sleep";

export async function retry<T>(fn: () => Promise<T>, retries = 2, delay = 200): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new TimeoutError();
      }

      throw err;
    }

    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
}
