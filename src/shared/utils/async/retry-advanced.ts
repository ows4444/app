import { sleep } from "./sleep";

type RetryOptions = {
  retries?: number;
  baseDelay?: number;
  maxDelay?: number;
  factor?: number;
  jitter?: boolean;
  maxElapsedTime?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

function computeDelay(attempt: number, base: number, factor: number, max: number, jitter: boolean) {
  let delay = Math.min(base * factor ** attempt, max);

  if (jitter) {
    delay = Math.random() * delay;
  }

  return delay;
}

export async function retryWithBackoff<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    retries = 3,
    baseDelay = 300,
    maxDelay = 5000,
    factor = 2,
    jitter = true,
    maxElapsedTime = 15_000,
    shouldRetry = () => true,
  } = options;

  const start = Date.now();

  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (err) {
      const elapsed = Date.now() - start;

      const canRetry = attempt < retries && elapsed < maxElapsedTime && shouldRetry(err, attempt);

      if (!canRetry) {
        throw err;
      }

      const delay = computeDelay(attempt, baseDelay, factor, maxDelay, jitter);

      await sleep(delay);
      attempt++;
    }
  }
}
