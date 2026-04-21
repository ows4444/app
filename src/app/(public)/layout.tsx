import { type JSX } from "react";

export default async function PublicLayout({ children }: { readonly children: React.ReactNode }): Promise<JSX.Element> {
  return Promise.resolve(<>{children}</>);
}
