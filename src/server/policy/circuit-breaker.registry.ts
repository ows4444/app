import { createCircuitBreaker } from "./circuit-breaker.policy";

export const circuitRegistry = {
  AUTH: createCircuitBreaker("auth", { failureThreshold: 5, resetTimeout: 10_000 }),
  API: createCircuitBreaker("api", { failureThreshold: 5, resetTimeout: 10_000 }),
} as const;
