import { apiClient } from "@/shared/lib/api-client";
import { jsonHeaders } from "@/shared/lib/headers";

import { type UserDTO } from "../types";

export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient("/auth/login", {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    }),

  me: () => apiClient<UserDTO>("/auth/me"),

  logout: () =>
    apiClient("/auth/logout", {
      method: "POST",
    }),
};
