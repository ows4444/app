import { loginInputSchema, userSchema } from "@/features/auth/api/contract";
import { apiClient } from "@/shared/infrastructure/api-client/api-client.client";

export const authApi = {
  async login(input: unknown, signal?: AbortSignal) {
    const parsed = loginInputSchema.parse(input);

    const res = await apiClient<unknown>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
      ...(signal && { signal }),
    });

    return userSchema.parse(res);
  },
  async me(signal?: AbortSignal) {
    const res = await apiClient<unknown>("/auth/me", {
      method: "GET",
      cache: "no-store",
      ...(signal && { signal }),
    });

    return userSchema.parse(res);
  },
};
