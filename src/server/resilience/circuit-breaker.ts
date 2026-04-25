type State = "CLOSED" | "OPEN" | "HALF_OPEN";
type Circuit = {
  failures: number;
  state: State;
  nextTry: number;
};
import "server-only";
import { redis } from "../cache/client";
export const runtime = "nodejs";
const FAILURE_THRESHOLD = 5;
const RESET_TIMEOUT = 10_000;
const keyFor = (key: string) => `circuit:${key}`;
export async function withCircuitBreaker<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const redisKey = keyFor(key);
  const circuit = (await redis.get<Circuit>(redisKey)) ?? {
    failures: 0,
    state: "CLOSED",
    nextTry: 0,
  };
  if (circuit.state === "OPEN") {
    if (now < circuit.nextTry) {
      throw new Error("CIRCUIT_OPEN");
    }
    circuit.state = "HALF_OPEN";
  }
  return fn()
    .then(async (res) => {
      circuit.failures = 0;
      circuit.state = "CLOSED";
      await redis.set(redisKey, circuit, { ex: 60 });
      return res;
    })
    .catch(async (err) => {
      circuit.failures++;
      if (circuit.failures >= FAILURE_THRESHOLD) {
        circuit.state = "OPEN";
        circuit.nextTry = now + RESET_TIMEOUT;
      }
      await redis.set(redisKey, circuit, { ex: 60 });
      throw err;
    });
}
