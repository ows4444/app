export function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}
