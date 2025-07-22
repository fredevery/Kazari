# Electron Main Process Architecture

The Electron Main Process serves as the central orchestrator for the Kazari desktop application, managing window lifecycle, application state, system integration, and secure communication with renderer processes. It acts as the backbone that coordinates all application functionality while maintaining security boundaries and ensuring proper separation of concerns. This addresses the critical need for a robust, scalable, and maintainable architecture that can handle multi-window timer synchronization, secure IPC communication, and future feature extensibility.

## Requirements

- Main process must manage the complete application lifecycle including startup, shutdown, and crash recovery
- Window management system must handle creation, destruction, and coordination of multiple window types (Dashboard, Break Screen, Floating Countdown, Planning)
- Timer service integration must provide centralized timer logic with real-time updates to all renderer windows
- IPC communication layer must provide type-safe, secure, and reliable message passing between processes
- Application state management must maintain consistency across all windows with proper persistence
- System integration layer must handle native OS features including notifications, system tray, and file system operations
- Security layer must validate all renderer communications and prevent unauthorized access to system resources
- Error handling and recovery mechanisms must ensure application stability and user data integrity
- Configuration management must handle user settings, application preferences, and runtime configuration
- Extensible architecture must support future addition of new window types and features without major refactoring

## Rules

- rules/electron-main-process.md
- rules/ipc-communication.md
- rules/hexagonal-architecture.md
- rules/state-management.md
- rules/electron-security.md
- rules/error-handling.md
- rules/typescript-standards.md

## Domain

```typescript
// Main process core domain model
interface ApplicationState {
  windows: WindowRegistry;
  timer: TimerState;
  tasks: TaskCollection;
  settings: UserSettings;
  session: SessionMetrics;
}

interface WindowRegistry {
  dashboard?: BrowserWindow;
  breakScreen?: BrowserWindow;
  floatingCountdown?: BrowserWindow;
  planning?: BrowserWindow;
}

interface MainProcessServices {
  windowManager: WindowManager;
  timerService: TimerService;
  ipcHandler: IPCHandler;
  stateManager: StateManager;
  notificationService: NotificationService;
  systemService: SystemService;
}

interface WindowManager {
  createWindow(type: WindowType, options?: WindowOptions): Promise<BrowserWindow>;
  destroyWindow(type: WindowType): Promise<void>;
  focusWindow(type: WindowType): Promise<void>;
  getWindow(type: WindowType): BrowserWindow | undefined;
  getAllWindows(): BrowserWindow[];
  handleWindowClosed(window: BrowserWindow): void;
}

interface IPCHandler {
  registerHandlers(): void;
  handleTimerActions(action: TimerAction): Promise<TimerState>;
  handleWindowActions(action: WindowAction): Promise<void>;
  handleTaskActions(action: TaskAction): Promise<TaskCollection>;
  broadcastToWindows(channel: string, data: any): void;
  validateMessage(message: IPCMessage): boolean;
}

interface StateManager {
  getState(): ApplicationState;
  updateState(updates: Partial<ApplicationState>): void;
  persistState(): Promise<void>;
  loadState(): Promise<ApplicationState>;
  subscribeToChanges(callback: StateChangeCallback): void;
}
```

## Extra Considerations

- Window creation timing must ensure proper initialization order to avoid race conditions
- IPC message queuing may be needed for renderer windows that aren't fully ready
- System tray integration should provide quick access to key features without opening windows
- Memory management requires proper cleanup of event listeners and window references
- Cross-platform compatibility must account for different OS window management behaviors
- Development vs production builds may require different security policies and debugging capabilities
- Performance optimization needed for high-frequency timer updates to multiple windows
- Graceful degradation when renderer processes crash or become unresponsive
- Hot reload support during development without losing application state
- Auto-updater integration for seamless application updates

## Testing Considerations

Unit tests must cover all main process services with mocked dependencies including BrowserWindow, file system, and system APIs. Integration tests should verify IPC communication flows with mock renderer processes. Window lifecycle testing must ensure proper creation, destruction, and state management. Timer service testing requires precise timing validation and state consistency checks. Error handling tests must validate recovery mechanisms for various failure scenarios. Security tests should verify input validation and access control for all IPC endpoints. Performance tests must validate timer precision and IPC throughput under load.

## Implementation Notes

Use dependency injection container for main process services to enable testing and modularity. Implement ports and adapters pattern to abstract system dependencies (file system, notifications, OS APIs). Use event-driven architecture for loose coupling between services. Implement proper TypeScript interfaces for all IPC contracts with runtime validation. Use structured logging with correlation IDs for debugging across processes. Follow single responsibility principle with dedicated services for each concern. Implement circuit breaker pattern for external dependencies. Use factory patterns for window creation with proper configuration. Implement observer pattern for state change notifications. Use async/await consistently for all asynchronous operations.

## Specification by Example

```typescript
// Window creation flow
const windowManager = container.get<WindowManager>('WindowManager');
const dashboardWindow = await windowManager.createWindow('dashboard', {
  width: 1200,
  height: 800,
  webPreferences: { nodeIntegration: false, contextIsolation: true }
});

// IPC communication example
ipcMain.handle('timer:start', async (): Promise<TimerState> => {
  try {
    const newState = await timerService.start();
    windowManager.broadcastToWindows('timer:state-changed', newState);
    return newState;
  } catch (error) {
    logger.error('Timer start failed', { error, correlationId: generateId() });
    throw new IPCError('TIMER_START_FAILED', 'Unable to start timer');
  }
});

// Window lifecycle example
app.on('window-all-closed', async () => {
  await stateManager.persistState();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Error recovery example
process.on('uncaughtException', async (error) => {
  logger.error('Uncaught exception in main process', { error });
  await stateManager.persistState();
  await windowManager.createWindow('error-recovery');
});
```

## Verification

- [ ] Application starts successfully and creates initial dashboard window
- [ ] Window manager can create, focus, and destroy windows of all types without memory leaks
- [ ] Timer service integrates properly with IPC communication and broadcasts updates to all windows
- [ ] IPC handlers validate all input and provide proper error responses
- [ ] State persistence works correctly across application restarts
- [ ] System tray integration provides access to key features
- [ ] Error handling gracefully recovers from renderer process crashes
- [ ] All IPC communications use typed interfaces with runtime validation
- [ ] Memory usage remains stable during extended operation with multiple windows
- [ ] Security measures prevent unauthorized access to system resources from renderers
- [ ] Performance requirements met for timer precision and IPC throughput
- [ ] Cross-platform compatibility verified on macOS, Windows, and Linux
- [ ] Development hot reload maintains application state during code changes
- [ ] All main process services properly testable with dependency injection
- [ ] Logging provides sufficient detail for debugging and monitoring
