import ClientProviders from "./providers.client";

export function StaticProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ClientProviders>{children}</ClientProviders>;
}
