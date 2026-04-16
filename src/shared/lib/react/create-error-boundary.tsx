"use client";

import React from "react";

import { normalizeError } from "@/shared/lib/errors/normalize";

type Options = {
  name: string;
  fallback?: (props: {
    reset: () => void;
    error: ReturnType<typeof normalizeError> | null;
    rawError: unknown | null;
  }) => React.ReactNode;
};

export function createErrorBoundary({ name, fallback }: Options) {
  return class GenericErrorBoundary extends React.Component<
    { children: React.ReactNode },
    {
      hasError: boolean;
      error: ReturnType<typeof normalizeError> | null;
      rawError: unknown;
    }
  > {
    state = { hasError: false, error: null, rawError: null };

    componentDidCatch(error: unknown) {
      const normalized = normalizeError(error);

      if (process.env.NODE_ENV !== "production") {
        console.error("React ErrorBoundary", normalized);
      }

      this.setState({ hasError: true, error: normalized, rawError: error });
    }

    reset = () => {
      this.setState({ hasError: false, error: null, rawError: null });
    };

    render() {
      if (this.state.hasError) {
        if (fallback) {
          return fallback({
            reset: this.reset,
            error: this.state.error,
            rawError: this.state.rawError,
          });
        }

        return (
          <div className="p-4 text-sm text-red-500">
            Something went wrong in {name}
            <button onClick={this.reset} className="ml-2 underline">
              Retry
            </button>
          </div>
        );
      }

      return this.props.children;
    }
  };
}
