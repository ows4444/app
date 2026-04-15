"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class AuthErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Auth Error:", error);
  }

  render() {
    if (this.state.hasError) {
      return <div>Auth error occurred</div>;
    }

    return this.props.children;
  }
}
