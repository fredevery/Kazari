# Break Screen System

The Break Screen System provides a dedicated full-screen interface for managing user breaks within the Kazari productivity application. It creates an immersive break experience that encourages users to step away from their work while maintaining awareness of break duration and overrun. The system displays a countdown timer, provides visual feedback for break overruns, and allows users to end breaks at any time. This addresses the common problem of unstructured breaks that can either be too short to be restful or too long to maintain productivity momentum.

## Requirements

- Break screen must display as a full-screen window that covers the entire screen
- Break countdown timer must be prominently displayed and continuously updated
- Timer must continue counting into negative values after reaching zero to show overrun
- Visual feedback must indicate when break time has been exceeded (color change, message, or styling)
- User must be able to end the break at any time and return to planning phase
- Break screen must integrate with the main timer system and receive real-time updates via IPC
- Screen must be responsive and work across different screen sizes and resolutions
- Break screen must handle window focus/blur events appropriately
- System must provide smooth transitions when entering and exiting break mode
- Break screen must persist across system sleep/wake cycles without losing state

## Rules

- rules/electron-main-process.md
- rules/ipc-communication.md
- rules/state-management.md
- rules/timer-precision.md
- rules/notification-system.md
- rules/error-handling.md

## Domain

```typescript
// Break screen domain model
interface BreakScreenState {
  isVisible: boolean;
  remainingTime: number; // in milliseconds, can be negative
  totalBreakTime: number; // in milliseconds
  isOverrun: boolean;
  overrunTime: number; // in milliseconds
  canEndEarly: boolean;
  breakStartTime: Date;
}

interface BreakScreenConfig {
  fullScreenMode: boolean;
  showProgressBar: boolean;
  overrunColor: string;
  normalColor: string;
  overrunMessage: string;
  allowEarlyEnd: boolean;
  showOverrunTime: boolean;
  enableSoundNotifications: boolean;
}

interface BreakScreenActions {
  endBreak(): void;
  toggleFullScreen(): void;
  updateDisplay(state: BreakScreenState): void;
  handleOverrun(overrunTime: number): void;
  handleKeyboardShortcuts(key: string): void;
}

class BreakScreen {
  private state: BreakScreenState;
  private config: BreakScreenConfig;
  private window: BrowserWindow;
  
  show(breakDuration: number): void;
  hide(): void;
  updateTimer(remainingTime: number): void;
  handleOverrun(): void;
  endBreak(): void;
  
  // IPC communication
  on(event: 'endBreak' | 'toggleFullScreen', callback: Function): void;
  emit(event: string, data: any): void;
}
```

## Extra Considerations

- Full-screen mode must handle multi-monitor setups and display on the primary monitor
- Break screen must prevent accidental closure but allow intentional user actions
- System must handle edge cases like screen resolution changes during break
- Break screen should be accessible with keyboard navigation and screen readers
- Performance must remain optimal even with continuous timer updates
- Visual feedback for overrun must be noticeable but not jarring or stressful
- Break screen must handle system events like screen lock/unlock gracefully
- Window must prevent interference with other applications or system dialogs
- Animation and transitions should be smooth and not cause performance issues
- Break screen must work correctly with different OS window management behaviors

## Testing Considerations

Unit tests must cover all break screen state transitions, timer calculations, and overrun detection logic with 95% code coverage. Integration tests should verify IPC communication between main process and break screen renderer, including real-time timer updates and user action handling. End-to-end tests must validate full-screen display across different screen resolutions and multi-monitor setups. Visual regression tests should ensure consistent appearance and proper overrun feedback display. Performance tests must verify smooth animations and responsive updates during continuous timer operation. Accessibility tests should validate keyboard navigation and screen reader compatibility.

## Implementation Notes

Use Electron's BrowserWindow with fullscreen and alwaysOnTop properties for the break screen. Implement the UI using React with smooth CSS transitions for timer updates and overrun feedback. Use high-resolution timestamps for accurate timer display and overrun calculations. Implement proper event handling for keyboard shortcuts (ESC to end break, space to toggle fullscreen). Use CSS animations for smooth color transitions when entering overrun state. Store break screen preferences in the main application configuration. Implement proper error handling for window creation/destruction. Follow accessibility guidelines for color contrast and keyboard navigation. Use CSS Grid or Flexbox for responsive layout across different screen sizes.

## Specification by Example

### Break Screen Display
```typescript
// When break starts
const breakState = {
  isVisible: true,
  remainingTime: 300000, // 5 minutes in milliseconds
  totalBreakTime: 300000,
  isOverrun: false,
  overrunTime: 0,
  canEndEarly: true,
  breakStartTime: new Date()
};

// Display shows: "Break Time: 5:00"
// User can press ESC or click "End Break" button
```

### Timer Overrun Scenario
```typescript
// When timer reaches zero and continues
const overrunState = {
  isVisible: true,
  remainingTime: -30000, // 30 seconds over
  totalBreakTime: 300000,
  isOverrun: true,
  overrunTime: 30000,
  canEndEarly: true,
  breakStartTime: new Date(Date.now() - 330000)
};

// Display shows: "Break Over: +0:30" in red color
// Background color changes to indicate overrun
// Message: "You're over your break time!"
```

### User Actions
```gherkin
Given the break screen is displayed
When the user presses the ESC key
Then the break should end immediately
And the app should transition to planning phase

Given the break timer shows overrun
When the user clicks "End Break"
Then the break should end
And overrun time should be recorded in session statistics
```

### IPC Communication
```typescript
// Main process to renderer
ipcRenderer.send('break-timer-update', {
  remainingTime: -15000,
  isOverrun: true,
  overrunTime: 15000
});

// Renderer to main process
ipcRenderer.send('end-break-request', {
  endTime: new Date(),
  overrunDuration: 15000
});
```

## Verification

- [ ] Break screen displays full-screen on primary monitor
- [ ] Timer countdown updates in real-time with smooth animations
- [ ] Timer continues into negative values after reaching zero
- [ ] Visual feedback (color change, message) appears during overrun
- [ ] User can end break early using ESC key or button click
- [ ] Break screen integrates with main timer system via IPC
- [ ] Screen remains responsive during continuous timer updates
- [ ] Window handles focus/blur events without losing functionality
- [ ] Smooth transitions when entering and exiting break mode
- [ ] Break screen persists correctly across system sleep/wake cycles
- [ ] Multi-monitor support displays on correct screen
- [ ] Keyboard navigation and accessibility features work properly
- [ ] Overrun time is accurately calculated and displayed
- [ ] Break statistics are properly recorded when break ends
- [ ] Error handling prevents break screen crashes or freezes
