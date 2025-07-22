---
description: "Electron main process development guidelines and patterns"
applyTo: "**/main/**/*.ts,**/electron/**/*.ts,main.ts"
---

# Electron Main Process Instructions

## Process Architecture

Implement a single main process that manages all application lifecycle and window operations.
Create separate modules for window management, IPC handling, timer logic, and application lifecycle.
Use dependency injection to provide services to different modules.
Implement proper cleanup on application quit.

## Window Management Patterns

Create window factory functions for each window type (Dashboard, FloatingCountdown, BreakScreen, PlanningWindow).
Store window references in a centralized window manager service.
Implement window state persistence using electron-store or similar.
Handle window focus, minimize, and close events appropriately.

## Timer System Implementation

Run all timer logic in the main process to ensure accuracy across windows.
Use high-precision timers with proper cleanup on application quit.
Broadcast timer updates to all windows via IPC every second.
Implement timer state persistence to survive application restarts.
Handle system sleep/wake events to pause/resume timers appropriately.

## IPC Channel Management

Define all IPC channels as typed interfaces with request and response objects.
Implement channel validation using TypeScript guards or Zod schemas.
Use consistent naming patterns for channels (e.g., 'timer:start', 'window:minimize').
Log IPC communications for debugging while avoiding sensitive data.
Implement rate limiting for channels that could be abused.

## Security Implementation

Never expose Node.js APIs directly to renderer processes.
Validate all data received from renderer processes before processing.
Use whitelisted IPC channels with explicit validation rules.
Implement proper session management if handling user authentication.
Log security-relevant events without exposing sensitive information.

## Application Lifecycle

Handle 'window-all-closed' event appropriately for different platforms.
Implement proper shutdown sequence with cleanup of timers and resources.
Handle 'activate' event for macOS to restore windows when dock icon clicked.
Save application state before quit and restore on startup.
Handle uncaught exceptions gracefully with proper logging.

## File System Operations

Use path.join() for cross-platform file path construction.
Implement proper error handling for file operations.
Use app.getPath() for accessing user directories.
Validate file paths to prevent directory traversal attacks.
Handle file permission errors gracefully.

## Menu and Tray Implementation

Create application menus with keyboard shortcuts.
Implement system tray functionality for background operation.
Update menu states based on application state (timer running, paused, etc.).
Handle right-click context menus appropriately.
Support platform-specific menu conventions.

## Error Handling

Implement centralized error handling for uncaught exceptions.
Log errors with appropriate detail levels (error, warn, info, debug).
Never expose stack traces or sensitive information to renderer processes.
Implement error recovery mechanisms where appropriate.
Provide meaningful error messages for common failure scenarios.
