const state = new Map<string, { failures: number; openUntil: number }>();

export async function withCircuit<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const s = state.get(key);

  if (s && s.openUntil > now) {
    throw new Error("CIRCUIT_OPEN");
  }

  try {
    const res = await fn();

    state.set(key, { failures: 0, openUntil: 0 });

    return res;
  } catch (err) {
    const failures = (s?.failures ?? 0) + 1;

    state.set(key, {
      failures,
      openUntil: failures >= 5 ? now + 10_000 : 0,
    });

    throw err;
  }
}
