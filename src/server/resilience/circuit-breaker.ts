type State = "CLOSED" | "OPEN" | "HALF_OPEN";
type Circuit = {
  failures: number;
  state: State;
  nextTry: number;
};
import "server-only";
import { getRedis } from "../cache/client";

const FAILURE_THRESHOLD = 5;
const RESET_TIMEOUT = 10_000;
const keyFor = (key: string) => `circuit:${key}`;

export async function withCircuitBreaker<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const redisKey = keyFor(key);
  const redis = getRedis();

  const raw = await redis.get(redisKey);

  const circuit: Circuit = raw ? JSON.parse(raw) : { failures: 0, state: "CLOSED", nextTry: 0 };

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

      await redis.set(redisKey, JSON.stringify(circuit), "EX", 60);

      return res;
    })
    .catch(async (err: unknown) => {
      const isRetryable =
        err instanceof Error &&
        !err.message.includes("400") &&
        !err.message.includes("401") &&
        !err.message.includes("403");

      if (isRetryable) {
        circuit.failures++;
      }

      if (circuit.failures >= FAILURE_THRESHOLD) {
        circuit.state = "OPEN";
        circuit.nextTry = now + RESET_TIMEOUT;
      }

      await redis.set(redisKey, JSON.stringify(circuit), "EX", 60);

      throw err;
    });
}
