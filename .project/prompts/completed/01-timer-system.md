# Pomodoro Timer System

The Pomodoro Timer System is the core productivity feature of the Kazari desktop application. It implements the Pomodoro Technique, which helps users maintain focus through structured work sessions with planned breaks. The system manages timer logic, state synchronization across multiple windows, and automatic phase transitions to create a seamless productivity workflow. This addresses the common problem of maintaining focus and preventing burnout during extended work sessions.

## Requirements

- Timer must support three distinct phases: Planning, Focus, and Break with configurable durations
- Timer logic must run exclusively in the Electron main process to ensure single source of truth
- All renderer windows must receive real-time timer updates via IPC communication
- User actions (start, pause, reset, skip) must be accepted from any window and synchronized across all windows
- Automatic transitions between phases must occur without user intervention
- Timer state must persist across application restarts
- System must handle multiple concurrent windows without state conflicts
- Timer must provide audio/visual notifications for phase transitions
- Timer must track session statistics (completed pomodoros, time spent per phase)
- System must gracefully handle window creation/destruction during active timer sessions

## Rules

- rules/electron-main-process.md
- rules/ipc-communication.md
- rules/state-management.md
- rules/timer-precision.md
- rules/notification-system.md

## Domain

```typescript
// Core timer domain model
interface TimerState {
  phase: 'planning' | 'focus' | 'break';
  status: 'idle' | 'running' | 'paused';
  remainingTime: number; // in milliseconds
  totalTime: number; // in milliseconds
  sessionCount: number;
  startTime?: Date;
  pausedTime?: Date;
}

interface TimerConfig {
  planningDuration: number; // in minutes
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // every N sessions
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

interface TimerSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  phase: 'planning' | 'focus' | 'break';
  completed: boolean;
  interrupted: boolean;
}

class PomodoroTimer {
  private state: TimerState;
  private config: TimerConfig;
  private interval?: NodeJS.Timeout;
  private sessions: TimerSession[] = [];

  start(): void;
  pause(): void;
  reset(): void;
  skip(): void;
  configure(config: Partial<TimerConfig>): void;
  getState(): TimerState;
  getStatistics(): TimerStatistics;
  
  // Events for IPC communication
  on(event: 'tick' | 'phaseChange' | 'stateChange', callback: Function): void;
  emit(event: string, data: any): void;
}
```

## Extra Considerations

- Timer precision must account for JavaScript's setTimeout/setInterval limitations and system sleep/wake cycles
- IPC message frequency must be balanced to provide real-time updates without overwhelming the system
- Timer state persistence must handle corruption scenarios and provide fallback defaults
- Window focus/blur events should not affect timer accuracy but may influence notification behavior
- System notifications must respect user's OS-level notification preferences
- Timer must handle edge cases like system time changes, daylight saving transitions
- Memory usage must remain minimal even with long-running timer sessions
- Error recovery must be robust when main process crashes or restarts
- Timer accuracy should degrade gracefully under high system load
- Cross-platform compatibility for notification sounds and system integration

## Testing Considerations

Unit tests must cover all timer state transitions, edge cases, and mathematical calculations with 95% code coverage. Integration tests should verify IPC communication between main and renderer processes, including message ordering and delivery guarantees. End-to-end tests must validate complete user workflows across multiple windows, including window creation/destruction during active sessions. Performance tests should measure timer accuracy under various system loads and verify memory usage remains stable during extended sessions. Acceptance tests should verify notification delivery, sound playback, and persistence across application restarts.

## Implementation Notes

Use TypeScript for type safety and better developer experience. Implement timer logic using high-resolution timestamps rather than simple intervals to maintain accuracy. Use Electron's IPC mechanisms (ipcMain/ipcRenderer) for communication between processes. Implement state management using the Observer pattern to notify all windows of changes. Store timer state in a JSON file in the user's application data directory. Use native OS notifications when available, with fallback to in-app notifications. Implement proper error handling and logging throughout the timer system. Follow clean architecture principles with clear separation between domain logic and infrastructure concerns.

## Specification by Example

```typescript
// Example timer workflow
const timer = new PomodoroTimer();

// Configure timer settings
timer.configure({
  planningDuration: 5,
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4
});

// Start planning phase
timer.start();
// State: { phase: 'planning', status: 'running', remainingTime: 300000, ... }

// After 5 minutes, automatically transition to focus
// State: { phase: 'focus', status: 'running', remainingTime: 1500000, ... }

// User pauses during focus
timer.pause();
// State: { phase: 'focus', status: 'paused', remainingTime: 800000, ... }

// User resumes
timer.start();
// State: { phase: 'focus', status: 'running', remainingTime: 800000, ... }

// After focus completes, automatically transition to break
// State: { phase: 'break', status: 'running', remainingTime: 300000, ... }
```

```javascript
// Example IPC communication
// Main process
ipcMain.handle('timer:start', () => {
  pomodoroTimer.start();
  return pomodoroTimer.getState();
});

ipcMain.handle('timer:getState', () => {
  return pomodoroTimer.getState();
});

// Renderer process
const startTimer = async () => {
  const newState = await ipcRenderer.invoke('timer:start');
  updateUI(newState);
};

// Real-time updates
ipcRenderer.on('timer:tick', (event, state) => {
  updateUI(state);
});
```

```json
// Example persisted state
{
  "currentState": {
    "phase": "focus",
    "status": "paused",
    "remainingTime": 845000,
    "totalTime": 1500000,
    "sessionCount": 3,
    "startTime": "2025-07-18T10:30:00.000Z",
    "pausedTime": "2025-07-18T10:41:15.000Z"
  },
  "config": {
    "planningDuration": 5,
    "focusDuration": 25,
    "breakDuration": 5,
    "longBreakDuration": 15,
    "longBreakInterval": 4,
    "autoStartBreaks": true,
    "autoStartFocus": false
  },
  "sessions": [
    {
      "id": "session_001",
      "startTime": "2025-07-18T09:00:00.000Z",
      "endTime": "2025-07-18T09:25:00.000Z",
      "phase": "focus",
      "completed": true,
      "interrupted": false
    }
  ]
}
```

## Verification

- [ ] Timer accurately tracks time with less than 1-second drift over 25-minute periods
- [ ] All three phases (Planning, Focus, Break) transition automatically at configured intervals
- [ ] Timer state synchronizes correctly across multiple open windows
- [ ] Start, pause, reset, and skip actions work from any window and update all windows
- [ ] Timer continues running when windows are closed and reopened
- [ ] Timer state persists correctly across application restarts
- [ ] System notifications appear at phase transitions with appropriate sounds
- [ ] Timer handles system sleep/wake cycles without losing accuracy
- [ ] Session statistics are tracked and persisted correctly
- [ ] Timer configuration can be changed and takes effect immediately
- [ ] Error states are handled gracefully with user-friendly messages
- [ ] Memory usage remains stable during extended timer sessions
- [ ] IPC communication performs efficiently with minimal latency
- [ ] Timer works correctly on all supported platforms (Windows, macOS, Linux)
- [ ] Unit test coverage exceeds 95% for all timer logic components
