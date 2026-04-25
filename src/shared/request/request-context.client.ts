let traceId: string | null = null;

export function getClientRequestContext() {
  if (!traceId) {
    traceId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `client-${Date.now()}`;
  }

  return {
    traceId,
    locale: null,
  };
}
