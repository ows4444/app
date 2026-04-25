export async function syncCsrfToken(res: Response) {
  const token = res.headers.get("x-csrf-token");

  if (token && typeof window !== "undefined") {
    const { setCsrfToken } = await import("@/shared/security/csrf.client");

    setCsrfToken(token);
  }
}
