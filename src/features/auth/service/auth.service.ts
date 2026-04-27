import { initSecurity } from "@/shared/api/bootstrap";
import { apiClient } from "@/shared/api/client/api-client";
import { type AuthFlow } from "@/shared/types/auth-flow";

type LoginPayload = {
  identifier: string;
};

export async function loginService(payload: LoginPayload) {
  await initSecurity();

  return apiClient<{
    user: { id: string; name: string };
    flow: AuthFlow;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
