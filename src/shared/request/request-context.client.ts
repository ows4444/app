export function getClientRequestContext() {
  return {
    traceId: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36),
    locale: null,
  };
}
