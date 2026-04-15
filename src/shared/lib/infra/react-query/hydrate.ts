import { dehydrate } from "@tanstack/react-query";
import { createQueryClient } from "./get-query-client";

export async function getDehydratedState(
  key: unknown[],
  fn: () => Promise<unknown>,
) {
  const queryClient = createQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: key,
      queryFn: fn,
    });
  } catch {
    // swallow errors (auth-safe)
  }

  return dehydrate(queryClient);
}
