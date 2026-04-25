import { useMutation } from "@tanstack/react-query";

import { resolveAuthFlow } from "../model/auth.flow";
import { loginService } from "../service/auth.service";

export function useLoginHandler() {
  const mutation = useMutation({ mutationFn: loginService });

  async function login(data: { identifier: string }) {
    const res = await mutation.mutateAsync(data);
    const flow = resolveAuthFlow(res.meta);
    return {
      flow,
      user: res.data.user,
    };
  }

  return {
    login,
    isLoading: mutation.isPending,
  };
}
