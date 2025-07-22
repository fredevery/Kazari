---
description: "Add comprehensive error handling patterns to application code"
mode: "agent"
tools: ["copilot_getErrorsFromFile", "copilot_findReferences"]
---

# Error Handling Implementation Prompt

Implement comprehensive error handling patterns throughout the application, focusing on user experience, debugging capabilities, and system resilience.

## Error Handling Strategy

### Error Categories
- **User Errors**: Invalid input, user action conflicts, validation failures
- **System Errors**: File system failures, network issues, permission problems  
- **Application Errors**: Logic errors, state inconsistencies, unexpected conditions
- **External Errors**: Third-party service failures, hardware issues, OS limitations

### Error Handling Layers
- **Presentation Layer**: User-friendly error messages and recovery options
- **Application Layer**: Error logging, state recovery, and fallback mechanisms
- **Domain Layer**: Business rule validation and constraint enforcement
- **Infrastructure Layer**: External system error handling and retry logic

## Implementation Requirements

### Typed Error Objects
Create specific error classes that extend the base Error class with additional context:
- Error codes for programmatic handling
- User-friendly messages for display
- Technical details for logging and debugging
- Recovery suggestions where applicable
- Severity levels (critical, warning, info)

### React Error Boundaries
Implement error boundaries around major component trees:
- Catch and handle component rendering errors
- Provide fallback UI with recovery options
- Log errors without exposing sensitive information
- Allow partial application recovery when possible

### Main Process Error Handling
Implement centralized error handling for the Electron main process:
- Catch uncaught exceptions and unhandled rejections
- Log errors with appropriate context and stack traces
- Prevent application crashes from recoverable errors
- Provide user notifications for critical errors

### IPC Error Handling
Implement proper error propagation across process boundaries:
- Serialize errors safely for IPC transmission
- Provide consistent error response formats
- Handle timeouts and communication failures
- Implement retry mechanisms where appropriate

### File System Error Handling
Handle common file system errors gracefully:
- Permission denied errors with user guidance
- Disk space limitations with cleanup suggestions
- File not found errors with recovery options
- Concurrent access issues with retry mechanisms

### Timer System Error Handling
Implement resilient timer operations:
- Handle system sleep/wake interruptions
- Recover from timer precision issues
- Manage state corruption scenarios
- Provide fallback timing mechanisms

## Error Handling Patterns

### Try-Catch with Context
```typescript
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', { 
    context: 'user-action', 
    userId, 
    error: error.message 
  });
  throw new UserFriendlyError('Unable to complete action', error);
}
```

### Result Pattern for Error-Prone Operations
```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };
```

### Error Recovery Strategies
- Automatic retry with exponential backoff
- Fallback to cached data when available
- Graceful degradation of functionality
- User-initiated retry mechanisms
- State reconstruction from persisted data

## Logging Requirements

### Error Logging Standards
- Log all errors with sufficient context for debugging
- Include relevant user and system state information
- Never log sensitive information like passwords or tokens
- Use structured logging for easier analysis
- Implement log rotation and retention policies

### Log Levels and Context
- ERROR: Critical issues requiring immediate attention
- WARN: Important issues that don't prevent operation
- INFO: General operational information
- DEBUG: Detailed information for troubleshooting

### Performance Impact
- Implement efficient logging that doesn't impact user experience
- Use asynchronous logging where possible
- Batch log entries for better performance
- Handle logging system failures gracefully

## User Experience Considerations

### Error Message Guidelines
- Use clear, non-technical language for user-facing errors
- Provide specific actions users can take to resolve issues
- Avoid exposing internal system details or stack traces
- Include relevant context like file names or operation types

### Recovery Mechanisms
- Provide "Try Again" options for transient errors
- Offer alternative approaches when primary methods fail
- Save user work before displaying critical errors
- Allow users to report errors with minimal effort

### Progressive Error Disclosure
- Show brief error messages initially
- Provide "More Details" options for technical users
- Include links to documentation or support resources
- Allow copying error information for support requests

## Implementation Checklist

### Critical Error Handling
- [ ] Uncaught exception handlers in main process
- [ ] React error boundaries around major components
- [ ] IPC error propagation and handling
- [ ] File system error recovery mechanisms
- [ ] Timer system error resilience

### Error Logging Implementation
- [ ] Structured error logging with context
- [ ] Log rotation and retention policies
- [ ] Security-conscious logging (no sensitive data)
- [ ] Performance-optimized logging implementation
- [ ] Error aggregation and monitoring setup

### User Experience Features
- [ ] User-friendly error messages
- [ ] Error recovery and retry mechanisms
- [ ] Progress indication during error recovery
- [ ] Error reporting functionality for users
- [ ] Graceful degradation for non-critical features
