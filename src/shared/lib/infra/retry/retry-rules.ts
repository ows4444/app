export function shouldRetryResponse(status: number) {
  return status >= 500 || status === 429;
}

export function shouldRetryError(err: unknown) {
  if (!(err instanceof Error)) return false;

  if (err.name === "AbortError") return true;

  if (err.message.includes("fetch failed")) return true;

  return false;
}
