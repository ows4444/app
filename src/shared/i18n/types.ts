import type global from "./messages/en.json";

export interface MessageNamespaces {
  common: typeof global.common;
}

export type Messages = {
  [K in keyof MessageNamespaces]: MessageNamespaces[K];
};
