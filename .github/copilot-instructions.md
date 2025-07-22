# Kazari - Productivity Desktop App Instructions

Kazari is a cross-platform desktop productivity application built with Electron, React, TypeScript, and Vite. It helps users plan their day, manage tasks, and take regular breaks using a Pomodoro-style timer system with multiple phases (Planning, Focus, Break).

## Core Architecture

Follow Clean Architecture principles with four distinct layers:
- Entities (Core business objects and rules)
- Use Cases (Application-specific business logic) 
- Interface Adapters (Controllers, presenters, data conversion)
- Frameworks & Drivers (Electron, React, external systems)

Dependencies must always point inward - inner layers never depend on outer layers.

## Technology Stack Standards

Use TypeScript with strict mode enabled for all code.
Structure the project with separate main process, preload scripts, and renderer processes.
Use Vite for build tooling and development server.
Follow React functional components with hooks pattern.
Implement proper IPC communication between processes using contextBridge.

## Security Requirements

Enable context isolation and disable node integration in all renderer processes.
Use contextBridge API exclusively for main-to-renderer communication.
Validate and sanitize all IPC channel data.
Enable sandbox mode for renderer processes when possible.
Implement Content Security Policy headers.

## Code Quality Standards

Write explicit return types for all public functions and methods.
Use interfaces for all complex object structures and API contracts.
Avoid `any` type - use `unknown` or specific types instead.
Implement proper error handling with typed error objects.
Add comprehensive JSDoc comments for all exported functions and classes.

## Timer System Domain

The core domain revolves around timer sessions with three phases:
- Planning Phase: User selects tasks and sets session goals
- Focus Phase: Countdown timer with floating window (becomes top-most in final minute)
- Break Phase: Full-screen break interface with overrun tracking

All timer logic runs in the main process and syncs to all windows via IPC.

## Window Management

Support multiple window types: Dashboard, Floating Countdown, Break Screen, Planning Interface.
Implement proper window lifecycle management with cleanup on close.
Use window state persistence for user preferences.
Handle window focus and visibility changes appropriately.

## Data Patterns

Use immutable state updates throughout the application.
Implement proper loading states and error boundaries.
Cache frequently accessed data appropriately.
Persist user data securely using Electron's safe storage patterns.

## Testing Approach

Write unit tests for all business logic and use cases.
Test IPC communication patterns thoroughly.
Implement integration tests for multi-window scenarios.
Use accessibility testing for all UI components.

## Performance Guidelines

Minimize main thread blocking operations.
Use proper memory management for timers and intervals.
Implement efficient state updates to prevent unnecessary re-renders.
Optimize asset loading and bundle sizes.

## Documentation Standards

Document all IPC channels with request/response types.
Include usage examples in component and function documentation.
Maintain clear README files for each major module.
Document architectural decisions and trade-offs.

## Error Handling

Implement comprehensive error boundaries in React components.
Log errors appropriately without exposing sensitive information.
Provide user-friendly error messages with recovery suggestions.
Handle network and file system errors gracefully.
