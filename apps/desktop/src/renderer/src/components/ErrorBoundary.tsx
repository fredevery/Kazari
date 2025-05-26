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
    this.setupWindowListeners();
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  setupWindowListeners() {
    window.addEventListener("error", (event) => {
      this.logger.error("Global error caught:", event.error);
      this.setState({ hasError: true, error: event.error });
    });
    
    window.addEventListener("unhandledrejection", (event) => {
      this.logger.error("Unhandled promise rejection caught:", event.reason);
      this.setState({ hasError: true, error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)) });
    });
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
    return <div>Something went wrong</div>;
  }

  renderFallback() {
    return this.props.fallback;
  }

  renderChildren() {
    return this.props.children;
  }
}
