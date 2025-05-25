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
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    window.logger.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) return this.renderErrorBoundary();
    return this.renderChildren();
  }

  renderErrorBoundary() {
    if (this.props.fallback) return this.props.fallback;
    return <div>Something went wrong</div>;
  }

  renderFallback() {
    return this.props.fallback;
  }

  renderChildren() {
    return this.props.children;
  }
}
