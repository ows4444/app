type Loader = (locale: string) => Promise<Record<string, unknown> | null>;

const registry: Record<string, Loader> = {};

export function registerMessages(namespace: string, loader: Loader) {
  if (registry[namespace]) {
    return; // idempotent for HMR
  }

  registry[namespace] = loader;
}

export function getMessageLoaders() {
  return registry;
}
