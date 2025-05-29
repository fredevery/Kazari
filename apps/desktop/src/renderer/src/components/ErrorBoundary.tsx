import { Component, type ErrorInfo, type ReactNode } from "react";
// import { logger } from "@/shared/logger.ts";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  logger: typeof window.kazari.logger;

  constructor(props: Props) {
    super(props);
    this.logger = window.kazari.logger;
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.logger.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) return this.renderErrorBoundary();
    return this.renderChildren();
  }

  renderErrorBoundary() {
    if (this.props.fallback) return this.props.fallback;
    return (
      <div>
        <h2>Something went wrong</h2>
        <button onClick={this.handleRetry}>Try Again</button>
      </div>
    )
  }

  renderFallback() {
    return this.props.fallback;
  }

  renderChildren() {
    return this.props.children;
  }

  handleRetry () {
    // Reset error state to re-render children
    this.setState({ hasError: false, error: null });
  }
}
