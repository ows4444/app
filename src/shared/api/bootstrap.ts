let csrfPromise: Promise<void> | null = null;

export async function initSecurity() {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (!csrfPromise) {
    csrfPromise = fetch("/api/auth/csrf", {
      credentials: "include",
    })
      .then(() => {})
      .catch((err) => {
        csrfPromise = null;

        throw err;
      });
  }

  return csrfPromise;
}
