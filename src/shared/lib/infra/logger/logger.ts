export function log(message: string, context?: Record<string, unknown>) {
  console.log(
    JSON.stringify({
      level: "info",
      message,
      ...context,
      ts: new Date().toISOString(),
    }),
  );
}

export function error(message: string, context?: Record<string, unknown>) {
  console.error(
    JSON.stringify({
      level: "error",
      message,
      ...context,
      ts: new Date().toISOString(),
    }),
  );
}
