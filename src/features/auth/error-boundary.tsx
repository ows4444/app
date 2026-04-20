import { createErrorBoundary } from "@/shared/react/create-error-boundary";

import { AuthErrorFallback } from "./error-fallback";

export const AuthErrorBoundary = createErrorBoundary({
  name: "Auth",
  fallback: ({ reset, error }) => <AuthErrorFallback reset={reset} error={error} />,
});
