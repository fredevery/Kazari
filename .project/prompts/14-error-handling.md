# Error Handling and Recovery System

_Implement a comprehensive error handling and recovery system for the Kazari Electron application that provides robust error management across both main and renderer processes, displays user-friendly error screens, enables diagnostic logging, and optionally supports external error reporting services._

## Requirements

- Implement error boundaries in React components to catch and handle renderer process errors gracefully
- Create a centralized error handling service in the main process that manages all error types and severities
- Design and implement user-friendly error screens that provide clear information and recovery options
- Establish comprehensive logging system that captures all errors with sufficient context for diagnostics
- Implement error recovery mechanisms that attempt to restore application state when possible
- Create error classification system with severity levels (critical, error, warning, info)
- Implement structured error types with error codes for programmatic handling
- Add optional integration with external error reporting services (e.g., Sentry, Bugsnag)
- Ensure error handling works seamlessly across IPC communication boundaries
- Implement retry logic for transient errors with appropriate backoff strategies

## Rules

- rules/error-handling.md
- rules/electron-main-process.md
- rules/ipc-communication.md
- rules/typescript-standards.md
- rules/state-management.md

## Domain

```typescript
// Error classification and types
enum ErrorSeverity {
  CRITICAL = 'critical',
  ERROR = 'error', 
  WARNING = 'warning',
  INFO = 'info'
}

interface ErrorContext {
  operation: string;
  component?: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class AppError extends Error {
  constructor(
    public code: string,
    public severity: ErrorSeverity,
    message: string,
    public context: ErrorContext,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Error handling service interface
interface ErrorHandlingService {
  handleError(error: AppError): Promise<void>;
  reportError(error: AppError): Promise<void>;
  attemptRecovery(error: AppError): Promise<boolean>;
  getUserFriendlyMessage(error: AppError): string;
}

// Error reporting configuration
interface ErrorReportingConfig {
  enabled: boolean;
  serviceUrl?: string;
  apiKey?: string;
  environment: string;
  userId?: string;
}

// Error UI states
interface ErrorScreenState {
  error: AppError;
  canRetry: boolean;
  canRecover: boolean;
  showTechnicalDetails: boolean;
}
```

## Extra Considerations

- Error handling must not introduce performance overhead in normal operation paths
- Error screens should be accessible and follow WCAG guidelines
- Sensitive information must be filtered from error logs and reports
- Error handling should work offline and queue reports for later transmission
- Recovery mechanisms must prevent infinite loops and cascading failures
- Error boundaries should not interfere with React DevTools in development
- External error reporting should be configurable and optional for privacy compliance
- Error handling should integrate with the existing logging infrastructure
- Consider rate limiting for error reporting to prevent spam
- Implement proper error handling for the timer system's critical operations

## Testing Considerations

- Unit tests for all error handling utilities and services
- Integration tests for IPC error handling and recovery scenarios  
- Component tests for error boundaries and error screen rendering
- End-to-end tests simulating various error conditions and recovery flows
- Performance tests to ensure error handling doesn't impact normal operations
- Manual testing of error screens with accessibility tools
- Testing error reporting service integration (with mocked endpoints)
- Testing offline error handling and queuing mechanisms
- Load testing error handling under high error volume scenarios

## Implementation Notes

- Use React Error Boundaries to catch renderer process errors at component boundaries
- Implement global error handlers for uncaught exceptions in both processes
- Create a centralized ErrorHandlingService in the main process using dependency injection
- Use structured logging with correlation IDs to trace errors across processes
- Implement error screen components with consistent design language
- Use toast notifications for non-critical errors that don't require user action
- Implement graceful degradation for non-critical features when errors occur
- Store error logs locally with rotation to prevent disk space issues
- Use TypeScript discriminated unions for error types to enable exhaustive handling
- Implement error handling middleware for IPC communication
- Consider using a state machine pattern for error recovery flows

## Specification by Example

### Error Boundary Implementation
```jsx
// Error boundary catches renderer errors
<ErrorBoundary
  fallback={<ErrorScreen canRetry={true} />}
  onError={(error, errorInfo) => {
    errorHandler.reportError(new AppError(
      'RENDERER_ERROR',
      ErrorSeverity.ERROR,
      error.message,
      { operation: 'component:render', component: errorInfo.componentStack }
    ));
  }}
>
  <TimerDashboard />
</ErrorBoundary>
```

### IPC Error Handling
```typescript
// Main process IPC handler with error handling
ipcMain.handle('timer:start', async (event): Promise<TimerState> => {
  try {
    const state = await timerService.start();
    logger.info('Timer started successfully', { operation: 'timer:start' });
    return state;
  } catch (error) {
    const appError = new AppError(
      'TIMER_START_FAILED',
      ErrorSeverity.ERROR,
      'Failed to start timer session',
      { operation: 'timer:start', sessionId: generateId() }
    );
    
    await errorHandler.handleError(appError);
    throw { code: appError.code, message: appError.message, severity: appError.severity };
  }
});

// Renderer process error handling
const startTimer = async (): Promise<TimerState> => {
  try {
    return await ipcRenderer.invoke('timer:start');
  } catch (ipcError) {
    const error = new AppError(
      ipcError.code || 'IPC_ERROR',
      ipcError.severity || ErrorSeverity.ERROR,
      ipcError.message || 'Communication error occurred',
      { operation: 'ipc:timer:start' }
    );
    
    errorHandler.showError(error);
    throw error;
  }
};
```

### Error Screen Component
```jsx
const ErrorScreen = ({ error, onRetry, onReportIssue }) => (
  <div className="error-screen">
    <h1>Something went wrong</h1>
    <p>{errorHandler.getUserFriendlyMessage(error)}</p>
    
    {error.recoverable && (
      <button onClick={onRetry}>Try Again</button>
    )}
    
    <button onClick={onReportIssue}>Report Issue</button>
    
    <details>
      <summary>Technical Details</summary>
      <pre>Error Code: {error.code}</pre>
    </details>
  </div>
);
```

### External Error Reporting
```typescript
class ErrorReportingService {
  async reportError(error: AppError): Promise<void> {
    if (!this.config.enabled) return;
    
    const report = {
      error_code: error.code,
      message: error.message,
      severity: error.severity,
      context: this.sanitizeContext(error.context),
      timestamp: error.context.timestamp.toISOString(),
      environment: this.config.environment
    };
    
    try {
      await fetch(this.config.serviceUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
        body: JSON.stringify(report)
      });
    } catch (networkError) {
      // Queue for later retry if offline
      await this.queueForRetry(report);
    }
  }
}
```
