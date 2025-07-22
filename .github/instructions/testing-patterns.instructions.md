---
description: "Testing strategies and patterns for comprehensive test coverage"
applyTo: "**/*.test.ts,**/*.spec.ts,**/__tests__/**/*.ts"
---

# Testing Instructions

## Test Structure and Organization

Organize tests by feature domain matching the application structure.
Use descriptive test names that clearly explain the behavior being tested.
Group related tests using describe blocks with clear context descriptions.
Follow the Arrange-Act-Assert pattern for test implementation.
Keep individual tests focused on a single behavior or outcome.

## Unit Testing Patterns

Test all business logic and use cases in isolation from external dependencies.
Mock external dependencies including file system, network, and timer operations.
Use dependency injection to make components testable in isolation.
Test both success paths and error conditions thoroughly.
Implement proper setup and teardown for test state management.

## React Component Testing

Use React Testing Library patterns for component testing.
Test component behavior and user interactions rather than implementation details.
Mock IPC communication appropriately in component tests.
Test accessibility features including keyboard navigation and screen readers.
Verify error boundaries work correctly with failing child components.

## IPC Communication Testing

Mock IPC channels in both main and renderer process tests.
Test data validation and error handling for all IPC channels.
Verify proper type safety in IPC message handling.
Test race conditions and concurrent access patterns.
Implement integration tests for multi-window communication scenarios.

## Timer System Testing

Mock system time functions to enable deterministic timer testing.
Test phase transitions and state management thoroughly.
Verify timer accuracy and drift correction mechanisms.
Test system sleep/wake handling with simulated events.
Implement tests for timer persistence and recovery scenarios.

## Electron Main Process Testing

Mock Electron APIs including app, BrowserWindow, and dialog modules.
Test window lifecycle management including creation, focus, and cleanup.
Verify application lifecycle events are handled correctly.
Test file system operations with proper error handling.
Mock system events like sleep, wake, and shutdown.

## Error Handling Testing

Test all error scenarios including network failures, file system errors, and invalid data.
Verify error messages are user-friendly and don't expose sensitive information.
Test error recovery mechanisms and fallback behaviors.
Verify proper error logging without sensitive data exposure.
Test error boundaries and global error handlers.

## Integration Testing

Test multi-process communication between main and renderer processes.
Verify window management across different window types.
Test complete user workflows including timer sessions and task management.
Implement tests for cross-platform compatibility where applicable.
Test application startup and shutdown sequences.

## Performance Testing

Implement tests for memory usage patterns and leak detection.
Test timer accuracy over extended periods.
Verify UI responsiveness during heavy operations.
Test large data set handling and pagination.
Implement benchmarks for critical performance paths.

## Test Data Management

Use factories or builders for creating consistent test data.
Implement proper test database setup and teardown for integration tests.
Use realistic test data that reflects actual usage patterns.
Avoid hardcoded test data - use configuration or generation instead.
Implement proper cleanup between tests to avoid state contamination.

## Accessibility Testing

Test keyboard navigation for all interactive elements.
Verify proper ARIA labels and screen reader compatibility.
Test color contrast and visual accessibility features.
Implement automated accessibility testing with appropriate tools.
Test with actual assistive technologies when possible.

## Coverage and Quality Standards

Maintain high test coverage for business logic and critical paths.
Use mutation testing to verify test quality where appropriate.
Implement proper assertions that verify actual behavior not just execution.
Test edge cases and boundary conditions thoroughly.
Document test scenarios and rationale for complex business logic.
