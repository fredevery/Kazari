# Multi-Window Management System

The Multi-Window Management System orchestrates the creation, coordination, and lifecycle management of multiple Electron windows within the Kazari desktop application. This system ensures seamless communication between the Dashboard, Floating Countdown, and Break Screen windows, maintaining synchronized timer states and managing window behaviors such as z-index ordering and always-on-top functionality. This addresses the complex challenge of maintaining consistent user experience across multiple concurrent windows while ensuring proper window hierarchy and real-time synchronization.

## Requirements

- Create and manage three distinct window types: Dashboard, Floating Countdown, and Break Screen
- Implement window lifecycle management including creation, destruction, and cleanup
- Ensure all windows receive real-time timer updates through IPC communication
- Maintain synchronized timer state across all active windows without conflicts
- Implement z-index management with Floating Countdown always on top during last minute of focus phase
- Handle window visibility states appropriately for each phase (focus, break, planning)
- Provide window restoration and positioning persistence across application restarts
- Implement proper window event handling for close, minimize, and focus events
- Support dynamic window creation/destruction based on timer phase transitions
- Ensure windows remain responsive and synchronized even during high system load
- Handle multiple monitor setups with appropriate window positioning
- Implement window-specific keyboard shortcuts and menu handling

## Rules

- rules/electron-main-process.md
- rules/ipc-communication.md
- rules/state-management.md
- rules/electron-security.md
- rules/error-handling.md
- rules/hexagonal-architecture.md
- rules/typescript-standards.md

## Domain

```typescript
// Core window management domain model
interface WindowConfig {
  id: string;
  type: 'dashboard' | 'floating-countdown' | 'break-screen';
  width: number;
  height: number;
  x?: number;
  y?: number;
  alwaysOnTop: boolean;
  skipTaskbar: boolean;
  resizable: boolean;
  frame: boolean;
  transparent: boolean;
  webPreferences: {
    nodeIntegration: boolean;
    contextIsolation: boolean;
    preload: string;
  };
}

interface WindowState {
  id: string;
  type: WindowType;
  isVisible: boolean;
  isMinimized: boolean;
  isFocused: boolean;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  display: {
    id: number;
    bounds: Rectangle;
  };
}

interface WindowManager {
  createWindow(config: WindowConfig): Promise<BrowserWindow>;
  destroyWindow(windowId: string): Promise<void>;
  showWindow(windowId: string): Promise<void>;
  hideWindow(windowId: string): Promise<void>;
  setAlwaysOnTop(windowId: string, flag: boolean): Promise<void>;
  broadcastToWindows(channel: string, data: any): void;
  getWindowState(windowId: string): WindowState | null;
  restoreWindowPositions(): Promise<void>;
  saveWindowPositions(): Promise<void>;
}

interface WindowEventHandler {
  onWindowCreated(window: BrowserWindow): void;
  onWindowDestroyed(windowId: string): void;
  onWindowFocus(windowId: string): void;
  onWindowBlur(windowId: string): void;
  onWindowMove(windowId: string, bounds: Rectangle): void;
  onWindowResize(windowId: string, bounds: Rectangle): void;
}
```

## Extra Considerations

- Windows must handle graceful shutdown when main process terminates
- Window positioning must account for display scaling and multiple monitor configurations
- Memory management for window destruction to prevent leaks
- Window creation order may affect z-index behavior across different operating systems
- Break screen must handle fullscreen mode transitions smoothly
- Floating countdown window must respect system accessibility settings
- Window focus behavior may vary between macOS, Windows, and Linux
- Some window properties may not be supported on all platforms
- Window creation timing must coordinate with timer phase transitions
- IPC message queuing during window creation/destruction phases
- Window state persistence must handle corrupted or missing configuration files
- Performance impact of multiple windows on system resources must be monitored

## Testing Considerations

- Unit tests for window configuration validation and state management
- Integration tests for IPC communication between windows and main process
- End-to-end tests for window lifecycle during timer phase transitions
- Performance tests for multiple window creation/destruction cycles
- Cross-platform tests for window behavior on macOS, Windows, and Linux
- Test window positioning and restoration across different display configurations
- Test z-index management during various timer states and phase transitions
- Test window cleanup and memory management during application shutdown
- Test IPC message synchronization under high load scenarios
- Test window focus behavior and keyboard shortcut handling
- Test window state persistence and recovery after application crashes
- Test accessibility features and screen reader compatibility

## Implementation Notes

- Use Electron's BrowserWindow API for window creation and management
- Implement window factory pattern for different window types
- Use event-driven architecture for window lifecycle management
- Implement window registry for tracking active windows and their states
- Use IPC channels dedicated to window management separate from timer communication
- Implement debouncing for window position/size change events
- Use async/await patterns for window operations to prevent blocking
- Implement proper error boundaries for window creation failures
- Use TypeScript strict mode for type safety in window configurations
- Implement logging for window operations for debugging and monitoring
- Use design patterns like Observer for window event handling
- Consider using window pools for frequently created/destroyed windows

## Specification by Example

### Window Creation Flow
```typescript
// Creating floating countdown window
const floatingConfig: WindowConfig = {
  id: 'floating-countdown',
  type: 'floating-countdown',
  width: 200,
  height: 100,
  alwaysOnTop: false, // becomes true in last minute
  skipTaskbar: true,
  resizable: false,
  frame: false,
  transparent: true
};

const window = await windowManager.createWindow(floatingConfig);
```

### Phase Transition Window Management
```gherkin
Given the timer is in focus phase with 2 minutes remaining
When the timer reaches 1 minute remaining
Then the floating countdown window should be set to always on top
And the floating countdown window should become visible above all other windows
And the dashboard window should remain accessible but not on top

Given the timer transitions from focus to break phase
When the break phase begins
Then the break screen window should be created in fullscreen mode
And the floating countdown window should be hidden
And the dashboard window should be minimized or hidden
```

### IPC Communication Example
```typescript
// Broadcasting timer update to all windows
windowManager.broadcastToWindows('timer-update', {
  phase: 'focus',
  remainingTime: 1500000, // 25 minutes in milliseconds
  totalTime: 1500000,
  status: 'running'
});

// Window-specific actions
ipcMain.handle('window-action', (event, action) => {
  const sourceWindow = BrowserWindow.fromWebContents(event.sender);
  switch (action.type) {
    case 'minimize':
      sourceWindow?.minimize();
      break;
    case 'close':
      windowManager.destroyWindow(sourceWindow?.id);
      break;
  }
});
```

### Window State Persistence
```json
{
  "windowStates": {
    "dashboard": {
      "bounds": { "x": 100, "y": 100, "width": 800, "height": 600 },
      "display": { "id": 1 },
      "isVisible": true
    },
    "floating-countdown": {
      "bounds": { "x": 1200, "y": 50, "width": 200, "height": 100 },
      "display": { "id": 1 },
      "isVisible": false
    }
  }
}
```

## Verification

- [ ] Dashboard window creates successfully and loads the main interface
- [ ] Floating countdown window creates with correct dimensions and transparency
- [ ] Break screen window creates in fullscreen mode and covers all displays
- [ ] All windows receive real-time timer updates via IPC communication
- [ ] Floating countdown window becomes always-on-top during last minute of focus phase
- [ ] Window positions persist across application restarts
- [ ] Window destruction properly cleans up event listeners and prevents memory leaks
- [ ] Multiple windows can be created and destroyed without affecting timer synchronization
- [ ] Window focus and blur events are properly handled for all window types
- [ ] Window states are correctly saved and restored after application crashes
- [ ] Cross-platform compatibility verified on macOS, Windows, and Linux
- [ ] Window behavior adapts correctly to multiple monitor configurations
- [ ] All IPC channels properly handle window creation/destruction events
- [ ] Window keyboard shortcuts work correctly for each window type
- [ ] Window accessibility features are properly implemented and tested
