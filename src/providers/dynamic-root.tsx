import { IntlDynamic } from "./dynamic/intl.dynamic";
import { NonceDynamic } from "./dynamic/nonce.dynamic";
import { getThemeData } from "./dynamic/theme.dynamic";
import { ThemeProvider } from "./theme-provider";

export async function DynamicProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = await getThemeData();
  return (
    <>
      <NonceDynamic />
      <IntlDynamic>
        <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>
      </IntlDynamic>
    </>
  );
}
