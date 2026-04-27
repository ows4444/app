import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loginService } from "../service/auth.service";

export function useLoginHandler() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: loginService,
    mutationKey: ["auth", "login", "v1"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  async function login(data: { identifier: string }) {
    const res = await mutation.mutateAsync(data);

    return {
      flow: res.flow,
      user: res.user,
    };
  }

  return {
    login,
    isLoading: mutation.isPending,
  };
}
