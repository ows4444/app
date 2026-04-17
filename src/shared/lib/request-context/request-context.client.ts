export function getClientRequestContext() {
  return {
    traceId: crypto.randomUUID(),
    locale: null,
  };
}
