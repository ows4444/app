import { setCsrfToken } from "@/shared/security/csrf.client";

export function syncCsrfToken(res: Response) {
  const token = res.headers.get("x-csrf-token");

  if (token) {
    setCsrfToken(token);
  }
}
