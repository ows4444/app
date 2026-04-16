export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const output: T = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
      const base = targetValue && typeof targetValue === "object" ? targetValue : ({} as Record<string, unknown>);

      output[key] = deepMerge(base as Record<string, unknown>, sourceValue as Record<string, unknown>) as T[typeof key];
    } else {
      output[key] = sourceValue as T[typeof key];
    }
  }

  return output;
}
