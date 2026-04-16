import auth from "./en.json";

declare module "@/shared/lib/i18n/types" {
  interface MessageNamespaces {
    auth: typeof auth;
  }
}
