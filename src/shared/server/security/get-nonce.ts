import "server-only";
import { headers } from "next/headers";

export async function getNonce(): Promise<string> {
  const headerStore = await headers();
  const nonce = headerStore.get("x-nonce");

  if (!nonce) {
    throw new Error("CSP nonce missing — middleware invariant broken");
  }

  return nonce;
}
