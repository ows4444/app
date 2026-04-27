let csrfPromise: Promise<void> | null = null;

export async function initSecurity() {
  csrfPromise ??= fetch("/api/auth/csrf", {
    credentials: "include",
  }).then(() => {});

  await csrfPromise;
}
