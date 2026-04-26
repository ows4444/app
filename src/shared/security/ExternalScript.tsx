"use client";

import Script from "next/script";

type Props = {
  src: string;
  nonce: string | undefined;
  strategy?: "beforeInteractive" | "afterInteractive" | "lazyOnload";
};

export function ExternalScript({ src, nonce, strategy = "afterInteractive" }: Readonly<Props>) {
  if (!nonce) {
    throw new Error("CSP nonce is required for all scripts");
  }

  return <Script src={src} nonce={nonce} strategy={strategy} />;
}
