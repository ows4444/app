"use client";

import Script from "next/script";

type Props = {
  src: string;
  nonce: string | undefined;
  strategy?: "beforeInteractive" | "afterInteractive" | "lazyOnload";
};

export function ExternalScript({ src, nonce, strategy = "afterInteractive" }: Readonly<Props>) {
  if (!nonce) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CSP nonce is required for external scripts");
    }
  }

  return <Script src={src} nonce={nonce} strategy={strategy} />;
}
