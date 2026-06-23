"use client";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          padding: "16px", background: "var(--bg-elevated, #0f1117)",
          borderRadius: "8px", border: "1px solid var(--border-color, #1e2330)",
        }}>
          <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: 600 }}>
            Erro ao carregar
          </p>
          <p style={{ color: "#64748b", fontSize: "11px", marginTop: "4px" }}>
            {this.state.error?.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
