# IPC Channels Documentation

This document describes the IPC channels used by Kazari and their request/response types.

Note: All channels are registered via the centralized IPCManager or by PomodoroIPCHandler and are exposed to the renderer only through the contextBridge API (`window.electronAPI`).

## Timer (Legacy)
- timer:create-session (renderer → main)
  - Request: { name: string; duration: number }
  - Response: IPCResult<LegacyTimerSession>
- timer:start-session (renderer → main)
  - Request: string (sessionId)
  - Response: IPCResult<LegacyTimerSession>
- timer:pause-session (renderer → main)
  - Request: string (sessionId)
  - Response: IPCResult<LegacyTimerSession>
- timer:stop-session (renderer → main)
  - Request: string (sessionId)
  - Response: IPCResult<LegacyTimerSession>
- timer:get-current-session (renderer → main)
  - Request: void
  - Response: IPCResult<LegacyTimerSession | null>
- timer:get-session-history (renderer → main)
  - Request: void
  - Response: IPCResult<readonly LegacyTimerSession[]>
- timer:session-updated (main → renderer event)
  - Payload: LegacyTimerSession
- timer:session-completed (main → renderer event)
  - Payload: LegacyTimerSession

## Pomodoro Timer (New)
- pomodoro:start (renderer → main)
  - Request: void
  - Response: IPCResult<TimerState>
- pomodoro:pause (renderer → main)
  - Request: void
  - Response: IPCResult<TimerState>
- pomodoro:reset (renderer → main)
  - Request: void
  - Response: IPCResult<TimerState>
- pomodoro:skip (renderer → main)
  - Request: void
  - Response: IPCResult<TimerState>
- pomodoro:configure (renderer → main)
  - Request: Partial<TimerConfig>
  - Response: IPCResult<TimerConfig>
  - Validation: All provided fields must be correctly typed; numeric fields must be positive.
- pomodoro:get-state (renderer → main)
  - Request: void
  - Response: IPCResult<TimerState>
- pomodoro:get-statistics (renderer → main)
  - Request: void
  - Response: IPCResult<TimerStatistics>
- pomodoro:tick (main → renderer event)
  - Payload: TimerState
- pomodoro:phase-changed (main → renderer event)
  - Payload: { fromPhase: TimerPhase; toPhase: TimerPhase; state: TimerState }
- pomodoro:state-changed (main → renderer event)
  - Payload: TimerState

## Settings
- settings:get (renderer → main)
  - Request: void
  - Response: IPCResult<TimerSettings>
- settings:update (renderer → main)
  - Request: { settings: Partial<TimerSettings> }
  - Response: IPCResult<TimerSettings>
  - Validation: If `settings.config` is provided, it must be a full TimerConfig. Other fields accept booleans.
- settings:updated (main → renderer event)
  - Payload: TimerSettings

## Window
- window:create (renderer → main)
  - Request: { type: WindowType; bounds?: { width; height; x?; y? }; alwaysOnTop?: boolean }
  - Response: IPCResult<void>
  - Validation: `type` must be one of: dashboard, floating-countdown, break-screen, planning. `bounds.width|height` must be positive numbers.
- window:close (renderer → main)
  - Request: void
  - Response: IPCResult<void>
- window:minimize (renderer → main)
  - Request: void
  - Response: IPCResult<void>
- window:maximize (renderer → main)
  - Request: void
  - Response: IPCResult<void>
- window:set-always-on-top (renderer → main)
  - Request: boolean
  - Response: IPCResult<void>
- window:get-state (renderer → main)
  - Request: void
  - Response: IPCResult<WindowState>

## App
- app:quit (renderer → main)
  - Request: void
  - Response: IPCResult<void>
- app:get-version (renderer → main)
  - Request: void
  - Response: IPCResult<string>
- app:show-notification (renderer → main)
  - Request: { title: string; body: string; icon?: string; silent?: boolean }
  - Response: IPCResult<void>
  - Validation: `title` and `body` must be non-empty strings.

## Error codes
- INVALID_CONFIG: Pomodoro configuration payload failed validation
- INVALID_SETTINGS: Settings update payload failed validation
- INVALID_REQUEST: Window creation or similar request failed validation
- INVALID_NOTIFICATION: Notification payload failed validation
