import ClientProviders from "./providers.client";

export async function StaticProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ClientProviders>{children}</ClientProviders>;
}
