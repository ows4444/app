import { redirect } from "next/navigation";

import { getMe } from "@/shared/api/server/get-me";
import { HttpError } from "@/shared/core/errors";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getMe().catch((err) => {
    if (err instanceof HttpError && err.status === 401) {
      redirect("/login");
    }

    throw err;
  });

  return <>{children(user)}</>;
}
