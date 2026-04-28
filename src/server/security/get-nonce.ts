import "server-only";
import crypto from "crypto";

import { headers } from "next/headers";

export async function getNonce(): Promise<string> {
  const headerStore = await headers();
  const nonce = headerStore.get("x-nonce");

  if (nonce) return nonce;

  return crypto.randomBytes(16).toString("base64");
}
