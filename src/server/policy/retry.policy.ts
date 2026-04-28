export async function withRetry<T>(fn: () => Promise<T>, retries = 2, opts?: { idempotent?: boolean }): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (!opts?.idempotent || attempt >= retries) throw err;

      if (err instanceof Error && "status" in err) {
        const status = (err as { status?: number }).status;

        // ❌ do not retry client errors
        if (status && status < 500) {
          throw err;
        }
      }

      await new Promise((r) => setTimeout(r, 100 * 2 ** attempt));
      attempt++;
    }
  }
}
