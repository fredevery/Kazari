---
description: "Timer system implementation patterns and state management"
applyTo: "**/timer/**/*.ts,**/services/timer/**/*.ts,**/store/timer/**/*.ts"
---

# Timer System Instructions

## Timer Architecture

Implement all timer logic in the main process for accuracy and consistency.
Use high-precision timers (process.hrtime.bigint()) for accurate time tracking.
Maintain timer state in a centralized service accessible via dependency injection.
Broadcast timer updates to all windows via IPC at regular intervals.
Implement proper cleanup and resource management for timer operations.

## Phase Management

Implement three distinct phases: Planning, Focus, and Break with clear state transitions.
Use a state machine pattern to manage phase transitions and valid state changes.
Store current phase, remaining time, and session metadata in a structured state object.
Implement automatic transitions between phases based on timer completion.
Handle manual phase transitions initiated by user actions.

## Time Precision and Accuracy

Use system monotonic time sources to avoid clock adjustments affecting timers.
Implement drift correction to maintain accuracy over long running sessions.
Handle system sleep/wake events by pausing and resuming timers appropriately.
Store timestamps for session start times to enable accurate time calculations.
Account for processing delays in timer update calculations.

## State Persistence

Save timer state to disk regularly to survive application restarts.
Implement proper recovery logic when restarting during an active session.
Store session history and statistics for analytics and user feedback.
Use atomic write operations to prevent data corruption during saves.
Encrypt sensitive timing data if privacy is a concern.

## Window Integration

Send timer updates to all windows via typed IPC channels.
Handle window creation and destruction by managing subscription lists.
Implement different update frequencies for different window types.
Use proper event debouncing to prevent excessive IPC traffic.
Handle offline windows gracefully by queuing updates when windows reconnect.

## Focus Phase Implementation

Display countdown in a floating window that can be covered by other applications.
Automatically bring the countdown window to front during the last minute.
Use platform-specific window management APIs for proper z-order control.
Implement proper window focus and blur event handling.
Handle multi-monitor setups by positioning the window appropriately.

## Break Phase Implementation

Create a full-screen break window that covers all displays.
Implement break timer with overrun tracking (negative time counting).
Provide visual indicators when break time is exceeded.
Allow user to end break early with appropriate confirmations.
Handle multi-monitor setups by covering all screens appropriately.

## User Interaction Handling

Implement proper validation for timer control actions (start, pause, stop, skip).
Handle conflicting user actions gracefully with appropriate error messages.
Implement undo functionality for accidental timer actions where appropriate.
Provide confirmation dialogs for destructive actions like session reset.
Log user actions for analytics and debugging purposes.

## Performance Optimization

Use efficient timer implementations that don't block the main thread.
Implement proper cleanup for timer intervals and event listeners.
Cache frequently accessed timer data to reduce computation overhead.
Use appropriate update frequencies based on UI requirements.
Implement proper memory management for long-running timer sessions.

## Error Recovery

Handle timer service failures with graceful degradation.
Implement automatic recovery from transient errors.
Provide user feedback when timer operations fail.
Log timer errors with sufficient context for debugging.
Implement fallback timing mechanisms for critical scenarios.
