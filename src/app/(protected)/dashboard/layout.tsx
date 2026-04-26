import { getUser } from "@/server/auth/get-auth";
import { DashboardWidget } from "@/widgets/dashboard/ui/dashboard.widget";

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();

  return (
    <>
      {user && <DashboardWidget {...user} />}
      {children}
    </>
  );
}
