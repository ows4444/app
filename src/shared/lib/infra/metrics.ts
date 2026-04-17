import { withContext } from "@/shared/lib/infra/logger/with-context.server";

type Labels = Record<string, string | number>;
const log = withContext({ scope: "metrics" });

function logMetric(type: string, name: string, value?: number, labels?: Labels | undefined) {
  if (process.env.NODE_ENV !== "production") {
    log.debug(
      JSON.stringify({
        type,
        name,
        value,
        labels,
        ts: new Date().toISOString(),
      }),
    );
  }
}

export const metrics = {
  increment(name: string, labels?: Labels) {
    logMetric("counter", name, 1, labels);
  },

  histogram(name: string, value: number, labels?: Labels) {
    logMetric("histogram", name, value, labels);
  },
};
