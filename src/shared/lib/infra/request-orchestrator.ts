import { mapToDomainError } from "@/shared/lib/error-mapper";
import { NetworkError } from "@/shared/lib/errors";
import { networkEvents } from "@/shared/lib/infra/network-events";

type OrchestratorOptions = {
  retries?: number;
  timeout?: number;
  dedupeKey?: string;
  signal?: AbortSignal;
};

export async function requestOrchestrator<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  options: OrchestratorOptions = {},
): Promise<T> {
  const { timeout = 8000 } = options;

  const controller = new AbortController();

  const parent = options.signal;

  if (parent) {
    if (parent.aborted) {
      controller.abort();
    } else {
      parent.addEventListener(
        "abort",
        () => {
          controller.abort();
        },
        { once: true },
      );
    }
  }

  const id = setTimeout(() => {
    controller.abort();
  }, timeout);

  // mark slow if taking too long
  const slowTimer = setTimeout(() => {
    networkEvents.slow.emit(true);
  }, 1500);

  try {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new NetworkError();
    }

    const result = await fn(controller.signal);

    clearTimeout(id);
    clearTimeout(slowTimer);
    networkEvents.slow.emit(false);

    return result;
  } catch (err) {
    clearTimeout(id);

    clearTimeout(slowTimer);
    networkEvents.slow.emit(false);

    const mapped = mapToDomainError(err);
    throw mapped;
  }
}
