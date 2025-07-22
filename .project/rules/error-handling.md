# Error Handling

_Rules for implementing comprehensive error handling in Electron applications to ensure graceful failure recovery, proper user feedback, and maintainable error management across processes._

## Context

**Applies to:** Electron applications, multi-process desktop apps, error-prone operations  
**Level:** Tactical - implementation patterns and error management strategies  
**Audience:** Electron developers, Frontend developers, QA engineers

## Core Principles

1. **Fail Fast:** Detect errors early and handle them at the appropriate level
2. **Graceful Degradation:** Applications should continue functioning when non-critical errors occur
3. **User Communication:** Users should receive clear, actionable error messages
4. **Observability:** All errors should be logged and traceable for debugging

## Rules

### Must Have (Critical)

- **RULE-001:** All async operations must have proper error handling with try-catch blocks
- **RULE-002:** IPC operations must handle both network-level and application-level errors
- **RULE-003:** User-facing errors must be translated into human-readable messages
- **RULE-004:** All errors must be logged with sufficient context for debugging
- **RULE-005:** Critical errors must prevent data corruption and provide recovery options
- **RULE-006:** Error boundaries must be implemented to prevent application crashes
- **RULE-007:** Errors must be classified by severity (critical, error, warning, info)

### Should Have (Important)

- **RULE-101:** Implement retry logic for transient errors with exponential backoff
- **RULE-102:** Use structured error types with error codes for programmatic handling
- **RULE-103:** Implement global error handlers to catch unhandled exceptions

### Could Have (Preferred)

- **RULE-201:** Implement error analytics and reporting for production monitoring

## Patterns & Anti-Patterns

### ✅ Do This

```typescript
// Define structured error types
class AppError extends Error {
  constructor(
    public code: string,
    public severity: 'critical' | 'error' | 'warning' | 'info',
    message: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Main process error handling
class TimerService {
  async start(): Promise<TimerState> {
    try {
      const state = await this.performStart();
      return state;
    } catch (error) {
      logger.error('Timer start failed', { 
        error: error.message, 
        context: { operation: 'timer:start' }
      });
      
      throw new AppError(
        'TIMER_START_FAILED',
        'error',
        'Failed to start timer. Please try again.',
        { originalError: error.message }
      );
    }
  }
}

// IPC error handling
ipcMain.handle('timer:start', async (event): Promise<TimerState> => {
  try {
    return await timerService.start();
  } catch (error) {
    logger.error('IPC timer:start failed', { error });
    
    if (error instanceof AppError) {
      throw { code: error.code, message: error.message, severity: error.severity };
    }
    
    throw { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', severity: 'error' };
  }
});

// Renderer process error handling
class TimerClient {
  async start(): Promise<TimerState> {
    try {
      const result = await ipcRenderer.invoke('timer:start');
      return result as TimerState;
    } catch (error) {
      logger.error('Timer start failed', { error });
      
      if (error.code) {
        this.handleStructuredError(error);
      } else {
        this.showError('An unexpected error occurred. Please try again.');
      }
      
      throw error;
    }
  }
  
  private handleStructuredError(error: any): void {
    const message = error.message || 'An error occurred';
    
    switch (error.severity) {
      case 'critical': this.showCriticalError(message); break;
      case 'error': this.showError(message); break;
      case 'warning': this.showWarning(message); break;
      default: this.showInfo(message);
    }
  }
}

// Global error handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  setTimeout(() => process.exit(1), 100);
});
```

### ❌ Don't Do This

```typescript
// Don't ignore errors
async function start() {
  try {
    await timerService.start();
  } catch (error) {
    // Silent failure - user doesn't know what happened
  }
}

// Don't expose internal errors to users
throw new Error('Database connection failed: ORA-00942: table or view does not exist');

// Don't use generic error handling
catch (error) {
  console.log('Something went wrong'); // No context, no recovery
}
```

## Decision Framework

**When handling errors:**

1. **Determine severity:** Is this critical, error, warning, or info?
2. **Identify scope:** Does this affect the whole app or just one feature?
3. **Plan recovery:** Can the user recover from this error?
4. **Consider retry:** Is this a transient error that might succeed on retry?

**When designing error messages:**

- Use clear, non-technical language for users
- Provide actionable guidance when possible
- Include error codes for support and debugging

## Exceptions & Waivers

**Valid reasons for exceptions:**

- Performance-critical paths where error handling adds significant overhead
- Legacy integration requiring specific error handling patterns

**Process for exceptions:**

1. Document the exception and risk assessment
2. Implement monitoring and alerting for the exception path

## Quality Gates

- **Automated checks:** ESLint rules for error handling patterns, test coverage for error paths
- **Code review focus:** Verify proper error handling, user-friendly messages, adequate logging
- **Testing requirements:** Unit tests for error scenarios, integration tests for error recovery

## Related Rules

- `rules/electron-main-process.md` - Main process error handling responsibilities
- `rules/ipc-communication.md` - IPC error handling and timeout patterns
- `rules/state-management.md` - Error handling in state management operations

## References

- [Node.js Error Handling](https://nodejs.org/api/errors.html) - Official Node.js error handling
- [Electron Error Handling](https://www.electronjs.org/docs/latest/tutorial/debugging-main-process) - Debugging and error handling

---

## TL;DR

**Key Principles:**

- All async operations must have proper error handling
- Errors must be classified by severity and handled appropriately
- Users must receive clear, actionable error messages
- All errors must be logged with sufficient context for debugging

**Critical Rules:**

- Must use try-catch blocks for all async operations (RULE-001)
- Must handle both network and application errors in IPC (RULE-002)
- Must translate technical errors into user-friendly messages (RULE-003)
- Must log all errors with debugging context (RULE-004)

**Quick Decision Guide:**
When in doubt: Ask "What should the user see and do when this fails?" Design error handling around user experience.

**Before You Code Checklist:**
- [ ] Error handling implemented for all async operations
- [ ] User-friendly error messages defined
- [ ] Proper logging with context included
- [ ] Error recovery mechanisms considered
- [ ] Error boundaries implemented where needed
