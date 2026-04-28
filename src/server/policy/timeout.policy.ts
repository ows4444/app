export function withTimeout(ms: number): AbortSignal {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, ms);

  controller.signal.addEventListener(
    "abort",
    () => {
      clearTimeout(timeout);
    },
    { once: true },
  );

  return controller.signal;
}
