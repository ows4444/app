import Script from "next/script";

import { env } from "@/config/server/env";

export async function ThemeScript({ nonce }: Readonly<{ nonce: string }>) {
  const isProduction = env.NODE_ENV === "production";

  if (!isProduction) {
    return (
      <script nonce={nonce} suppressHydrationWarning>
        {`!function(){try{"dark"===localStorage.getItem("theme")&&document.documentElement.classList.add("dark")}catch{}}();`}
      </script>
    );
  }

  return (
    <Script id="theme-init" nonce={nonce} strategy="afterInteractive">
      {`!function(){try{"dark"===localStorage.getItem("theme")&&document.documentElement.classList.add("dark")}catch{}}();`}
    </Script>
  );
}
