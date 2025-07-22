---
description: "Inter-Process Communication patterns and security guidelines"
applyTo: "**/ipc/**/*.ts,**/preload/**/*.ts,**/main/ipc/**/*.ts"
---

# IPC Communication Instructions

## Channel Definition Patterns

Define all IPC channels using branded string types to prevent typos.
Create request and response interfaces for each channel with proper typing.
Use consistent naming conventions like 'domain:action' (e.g., 'timer:start', 'window:minimize').
Group related channels into separate modules by domain.
Export channel names as constants to ensure consistency across processes.

## ContextBridge Implementation

Use contextBridge.exposeInMainWorld() exclusively for exposing APIs to renderer.
Never expose Node.js APIs directly - always wrap them in safe abstractions.
Implement proper validation for all data passed through contextBridge.
Use TypeScript interfaces to define the shape of exposed APIs.
Keep the exposed API surface minimal - only expose what's actually needed.

## Data Validation and Sanitization

Validate all incoming data using TypeScript type guards or schema validation.
Sanitize string inputs to prevent injection attacks.
Implement size limits for data payloads to prevent memory exhaustion.
Use allowlists for enum values rather than denylists.
Log validation failures for debugging without exposing sensitive data.

## Error Handling Patterns

Implement consistent error response formats across all channels.
Never expose stack traces or system information to renderer processes.
Use typed error objects with error codes and user-friendly messages.
Implement proper fallback responses for when operations fail.
Log errors in main process with appropriate detail levels.

## Async Communication Patterns

Use proper Promise-based patterns for async IPC operations.
Implement timeouts for long-running operations.
Handle race conditions in multi-window scenarios appropriately.
Use proper cancellation patterns for ongoing operations.
Implement progress updates for long-running tasks.

## Security Implementation

Implement rate limiting for channels that could be called frequently.
Use allowlisted channels - reject any unrecognized channel names.
Validate the origin of IPC calls when security is critical.
Never trust renderer-provided file paths - validate and sandbox them.
Implement proper authentication for sensitive operations.

## State Synchronization

Broadcast state changes to all interested windows using IPC.
Implement proper conflict resolution for concurrent updates.
Use immutable data structures for state updates.
Cache frequently accessed data appropriately.
Handle window lifecycle events for state cleanup.

## Channel Organization

Group channels by feature domain (timer, window, task, etc.).
Implement separate handler modules for each domain.
Use middleware patterns for cross-cutting concerns like logging and validation.
Export typed channel interfaces for use in both main and renderer processes.
Document all channels with their purpose and expected usage patterns.

## Performance Optimization

Minimize the frequency of IPC calls where possible.
Batch related operations into single IPC calls when appropriate.
Use efficient serialization for complex data structures.
Implement proper cleanup for event listeners and subscriptions.
Avoid sending large objects through IPC - use references or streams instead.

## Testing Strategies

Mock IPC communication in unit tests using proper abstractions.
Test both success and failure scenarios for all channels.
Implement integration tests for multi-process communication.
Test data validation thoroughly with edge cases and malformed data.
Verify security measures are working correctly in tests.
