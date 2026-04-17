export function getRequestContext() {
  return {
    traceId: crypto.randomUUID(),
    locale: null,
  };
}
