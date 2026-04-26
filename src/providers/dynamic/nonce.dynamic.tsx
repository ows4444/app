import { getNonce } from "@/shared/server/security/get-nonce";
import { ThemeScript } from "@/shared/theme/theme-script";

export async function NonceDynamic() {
  const nonce = await getNonce();

  return <ThemeScript nonce={nonce} />;
}
