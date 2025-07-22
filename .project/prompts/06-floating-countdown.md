# Floating Countdown Window

The Floating Countdown Window is a small, persistent timer display that provides users with continuous visibility of their focus session progress without being intrusive. It serves as an always-present reminder of remaining time while allowing users to maintain focus on their work. The window intelligently manages its visibility and z-index behavior, staying unobtrusive for most of the session but becoming prominent during the final minute to ensure users are aware of the approaching session end. This addresses the common problem of losing track of time during focused work sessions while avoiding the distraction of constantly visible timers.

## Requirements

- Floating window must display as a small, compact timer showing remaining focus session time
- Window must be always-on-top initially but allow other windows to cover it during normal operation
- During the last minute of a focus session, window must automatically appear on top of all other windows
- Timer display must synchronize in real-time with the main timer system via IPC communication
- Window must be repositionable by the user and remember its position across sessions
- Window must handle window creation, destruction, and state management programmatically
- Z-index and window layering must be managed automatically based on session time remaining
- Window must be resizable within defined constraints to accommodate different screen sizes
- Window must provide visual feedback for different timer states (running, paused, low time)
- Window must handle multi-monitor setups and stay within visible screen boundaries

## Rules

- rules/electron-main-process.md
- rules/ipc-communication.md
- rules/state-management.md
- rules/timer-precision.md
- rules/notification-system.md
- rules/error-handling.md

## Domain

```typescript
// Floating countdown domain model
interface FloatingCountdownState {
  isVisible: boolean;
  remainingTime: number; // in milliseconds
  totalTime: number; // in milliseconds
  phase: 'planning' | 'focus' | 'break';
  status: 'idle' | 'running' | 'paused';
  isAlwaysOnTop: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isLastMinute: boolean;
}

interface FloatingCountdownConfig {
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  maxSize: { width: number; height: number };
  alwaysOnTopThreshold: number; // seconds remaining when window becomes always-on-top
  opacity: number;
  hideWhenNotFocusPhase: boolean;
  enableDragging: boolean;
  enableResizing: boolean;
  showSeconds: boolean;
  theme: 'light' | 'dark' | 'system';
}

interface FloatingCountdownWindow {
  show(): void;
  hide(): void;
  updateTimer(remainingTime: number): void;
  setAlwaysOnTop(alwaysOnTop: boolean): void;
  setPosition(x: number, y: number): void;
  setSize(width: number, height: number): void;
  handleLastMinute(): void;
  saveWindowState(): void;
  restoreWindowState(): void;
}

class FloatingCountdown {
  private state: FloatingCountdownState;
  private config: FloatingCountdownConfig;
  private window: BrowserWindow;
  private lastMinuteTriggered: boolean = false;
  
  create(): void;
  destroy(): void;
  updateDisplay(timerState: TimerState): void;
  manageZIndex(remainingTime: number): void;
  handleWindowEvents(): void;
  
  // IPC communication
  on(event: 'positionChanged' | 'sizeChanged' | 'closed', callback: Function): void;
  emit(event: string, data: any): void;
}
```

## Extra Considerations

- Window must handle edge cases like screen resolution changes during session
- Z-index management must work across different operating systems (Windows, macOS, Linux)
- Window dragging must be constrained to prevent it from being moved off-screen
- Performance must remain optimal with continuous timer updates and position tracking
- Window must handle system events like screen lock/unlock gracefully
- Multi-monitor support must correctly position window on appropriate display
- Window state persistence must handle corruption and provide sensible defaults
- Memory usage must be minimal for a continuously running background window
- Window must not interfere with other applications or system dialogs
- Visual design must be clean and unobtrusive while remaining clearly visible

## Testing Considerations

Unit tests must cover all timer calculations, z-index management logic, and window state transitions with 95% code coverage. Integration tests should verify IPC communication between main process and floating window renderer, including real-time timer synchronization and window management commands. End-to-end tests must validate window positioning, resizing, and always-on-top behavior across different screen configurations. Visual regression tests should ensure consistent appearance and proper timer display formatting. Performance tests must verify smooth updates during continuous operation without memory leaks. Cross-platform tests should validate window behavior on Windows, macOS, and Linux operating systems.

## Implementation Notes

Use Electron's BrowserWindow with specific properties for floating behavior (alwaysOnTop, skipTaskbar, minimizable: false). Implement the UI using React with efficient re-rendering to handle frequent timer updates. Use CSS for smooth transitions when changing window states and visual feedback. Implement proper event handling for window dragging, resizing, and positioning. Store window state in application configuration with automatic persistence. Use high-resolution timestamps for accurate timer display synchronization. Implement proper error handling for window creation/destruction and IPC communication. Follow platform-specific UI guidelines for floating windows. Use CSS-in-JS or styled-components for dynamic theming and responsive design.

## Specification by Example

### Normal Operation
```typescript
// During focus session with 10 minutes remaining
const normalState = {
  isVisible: true,
  remainingTime: 600000, // 10 minutes
  totalTime: 1500000, // 25 minutes
  phase: 'focus',
  status: 'running',
  isAlwaysOnTop: false, // Can be covered by other windows
  position: { x: 100, y: 100 },
  size: { width: 200, height: 80 },
  isLastMinute: false
};

// Display shows: "Focus: 10:00"
// Window can be covered by other applications
```

### Last Minute Behavior
```typescript
// When less than 1 minute remains
const lastMinuteState = {
  isVisible: true,
  remainingTime: 45000, // 45 seconds
  totalTime: 1500000,
  phase: 'focus',
  status: 'running',
  isAlwaysOnTop: true, // Now always on top
  position: { x: 100, y: 100 },
  size: { width: 200, height: 80 },
  isLastMinute: true
};

// Display shows: "Focus: 0:45" with visual emphasis
// Window appears on top of all other windows
// Background color may change to indicate urgency
```

### Window Positioning
```gherkin
Given the floating countdown window is displayed
When the user drags the window to a new position
Then the window should move to the new position
And the position should be saved in application settings
And the window should appear at the saved position on next session

Given the window is positioned near screen edge
When the screen resolution changes
Then the window should be repositioned to remain visible
And the new position should be within screen boundaries
```

### IPC Communication
```typescript
// Main process to renderer
ipcRenderer.send('floating-countdown-update', {
  remainingTime: 45000,
  phase: 'focus',
  status: 'running',
  shouldBeAlwaysOnTop: true
});

// Renderer to main process
ipcRenderer.send('floating-countdown-position-changed', {
  x: 150,
  y: 200
});

// Z-index management
ipcRenderer.send('set-always-on-top', {
  alwaysOnTop: true,
  reason: 'last-minute-warning'
});
```

### Window State Management
```typescript
// Window configuration
const windowConfig = {
  width: 200,
  height: 80,
  frame: false,
  resizable: true,
  alwaysOnTop: false,
  skipTaskbar: true,
  minimizable: false,
  maximizable: false,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
};

// Position constraints
const ensureVisible = (x: number, y: number) => {
  const screen = electron.screen.getPrimaryDisplay();
  const maxX = screen.bounds.width - windowConfig.width;
  const maxY = screen.bounds.height - windowConfig.height;
  
  return {
    x: Math.max(0, Math.min(x, maxX)),
    y: Math.max(0, Math.min(y, maxY))
  };
};
```

## Verification

- [ ] Floating window displays correctly as small, compact timer
- [ ] Window is initially always-on-top but allows other windows to cover it
- [ ] During last minute, window automatically becomes always-on-top
- [ ] Timer synchronizes in real-time with main timer system
- [ ] Window position is saved and restored across sessions
- [ ] Window can be dragged and repositioned by user
- [ ] Window handles creation, destruction, and state management properly
- [ ] Z-index behavior changes automatically based on remaining time
- [ ] Window stays within screen boundaries during repositioning
- [ ] Window provides visual feedback for different timer states
- [ ] Multi-monitor support positions window on correct display
- [ ] Window resizing works within defined constraints
- [ ] Performance remains optimal during continuous operation
- [ ] Window handles system events (screen lock/unlock) gracefully
- [ ] Cross-platform compatibility works on Windows, macOS, and Linux
