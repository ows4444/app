export function ThemeScript({ nonce }: Readonly<{ nonce?: string | null }>) {
  if (!nonce && process.env.NODE_ENV === "production") {
    throw new Error("CSP nonce is required for inline script");
  }

  const script = `
     (function() {
       try {
         var theme = document.cookie
           .split("; ")
           .find(row => row.startsWith("theme="))
           ?.split("=")[1];

         if (!theme || theme === "system") {
           var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
           theme = dark ? "dark" : "light";
         }

         document.documentElement.classList.toggle("dark", theme === "dark");
       } catch (e) {}
     })();
   `;

  return <script nonce={nonce ?? undefined} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: script }} />;
}
