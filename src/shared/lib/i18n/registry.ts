type Loader = (locale: string) => Promise<Record<string, unknown> | null>;

const registry: Record<string, Loader> = {};

export function registerMessages(namespace: string, loader: Loader) {
  if (registry[namespace]) {
    throw new Error(`i18n namespace already registered: ${namespace}`);
  }

  registry[namespace] = loader;
}

export function getMessageLoaders() {
  return registry;
}
