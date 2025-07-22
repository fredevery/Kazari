import {
  APP_CHANNELS,
  CreateSessionIPCRequest,
  CreateWindowIPCRequest,
  IPCError,
  IPCResult,
  SETTINGS_CHANNELS,
  ShowNotificationIPCRequest,
  TIMER_CHANNELS,
  UpdateSettingsIPCRequest,
  WINDOW_CHANNELS
} from '@shared/types/ipc';
import {
  NotificationService,
  PomodoroTimerService,
  SettingsRepository,
  TimerConfig,
  TimerService // Legacy service
  ,
  TimerSettings
} from '@shared/types/timer';
import { BrowserWindow, ipcMain } from 'electron';
import { WindowManager } from './window-manager';

/**
 * Enhanced IPC Handler
 * Manages all Inter-Process Communication with support for both legacy and Pomodoro APIs
 * Implements type-safe IPC with proper error handling and validation
 */
export class PomodoroIPCHandler {
  constructor(
    private readonly pomodoroTimerService: PomodoroTimerService,
    private readonly legacyTimerService: TimerService, // For backwards compatibility
    private readonly settingsRepository: SettingsRepository,
    private readonly windowManager: WindowManager,
    private readonly notificationService: NotificationService
  ) {
    this.setupPomodoroTimerChannels();
    this.setupLegacyTimerChannels();
    this.setupSettingsChannels();
    this.setupWindowChannels();
    this.setupAppChannels();
    this.setupEventBroadcasting();
  }

  /**
   * Setup new Pomodoro timer IPC channels
   */
  private setupPomodoroTimerChannels(): void {
    // Start timer
    ipcMain.handle(TIMER_CHANNELS.START_TIMER, async () => {
      const result = await this.pomodoroTimerService.start();
      return this.convertToIPCResult(result);
    });

    // Pause timer
    ipcMain.handle(TIMER_CHANNELS.PAUSE_TIMER, async () => {
      const result = await this.pomodoroTimerService.pause();
      return this.convertToIPCResult(result);
    });

    // Reset timer
    ipcMain.handle(TIMER_CHANNELS.RESET_TIMER, async () => {
      const result = await this.pomodoroTimerService.reset();
      return this.convertToIPCResult(result);
    });

    // Skip to next phase
    ipcMain.handle(TIMER_CHANNELS.SKIP_PHASE, async () => {
      const result = await this.pomodoroTimerService.skip();
      return this.convertToIPCResult(result);
    });

    // Configure timer
    ipcMain.handle(TIMER_CHANNELS.CONFIGURE_TIMER, async (_, config: Partial<TimerConfig>) => {
      if (!this.isValidTimerConfig(config)) {
        return this.createErrorResult('INVALID_CONFIG', 'Invalid timer configuration');
      }

      const result = await this.pomodoroTimerService.configure(config);
      return this.convertToIPCResult(result);
    });

    // Get current timer state
    ipcMain.handle(TIMER_CHANNELS.GET_TIMER_STATE, async () => {
      const result = await this.pomodoroTimerService.getState();
      return this.convertToIPCResult(result);
    });

    // Get timer statistics
    ipcMain.handle(TIMER_CHANNELS.GET_STATISTICS, async () => {
      const result = await this.pomodoroTimerService.getStatistics();
      return this.convertToIPCResult(result);
    });
  }

  /**
   * Setup legacy timer IPC channels for backwards compatibility
   */
  private setupLegacyTimerChannels(): void {
    // Create session (legacy)
    ipcMain.handle(TIMER_CHANNELS.CREATE_SESSION, async (_, request: CreateSessionIPCRequest) => {
      if (!this.isValidCreateSessionRequest(request)) {
        return this.createErrorResult('INVALID_REQUEST', 'Invalid session creation request');
      }

      const result = await this.legacyTimerService.createSession({
        phase: 'focus', // Default to focus phase for legacy sessions
        name: request.name,
        duration: request.duration,
      } as any); // Cast to any for backwards compatibility

      return this.convertToIPCResult(result);
    });

    // Start session (legacy)
    ipcMain.handle(TIMER_CHANNELS.START_SESSION, async (_, sessionId: string) => {
      if (!sessionId || typeof sessionId !== 'string') {
        return this.createErrorResult('INVALID_REQUEST', 'Invalid session ID');
      }

      const result = await this.legacyTimerService.startSession(sessionId);

      if (result.success) {
        this.broadcastToAllWindows(TIMER_CHANNELS.SESSION_UPDATED, result.data);
      }

      return this.convertToIPCResult(result);
    });

    // Pause session (legacy)
    ipcMain.handle(TIMER_CHANNELS.PAUSE_SESSION, async (_, sessionId: string) => {
      if (!sessionId || typeof sessionId !== 'string') {
        return this.createErrorResult('INVALID_REQUEST', 'Invalid session ID');
      }

      const result = await this.legacyTimerService.pauseSession(sessionId);

      if (result.success) {
        this.broadcastToAllWindows(TIMER_CHANNELS.SESSION_UPDATED, result.data);
      }

      return this.convertToIPCResult(result);
    });

    // Stop session (legacy)
    ipcMain.handle(TIMER_CHANNELS.STOP_SESSION, async (_, sessionId: string) => {
      if (!sessionId || typeof sessionId !== 'string') {
        return this.createErrorResult('INVALID_REQUEST', 'Invalid session ID');
      }

      const result = await this.legacyTimerService.stopSession(sessionId);

      if (result.success) {
        this.broadcastToAllWindows(TIMER_CHANNELS.SESSION_UPDATED, result.data);
      }

      return this.convertToIPCResult(result);
    });

    // Get current session (legacy)
    ipcMain.handle(TIMER_CHANNELS.GET_CURRENT_SESSION, async () => {
      const result = await this.legacyTimerService.getCurrentSession();
      return this.convertToIPCResult(result);
    });

    // Get session history
    ipcMain.handle(TIMER_CHANNELS.GET_SESSION_HISTORY, async () => {
      // Use Pomodoro service for session history
      const result = await this.pomodoroTimerService.getHistory();
      return this.convertToIPCResult(result);
    });
  }

  /**
   * Setup settings-related IPC channels
   */
  private setupSettingsChannels(): void {
    // Get settings
    ipcMain.handle(SETTINGS_CHANNELS.GET_SETTINGS, async () => {
      try {
        const settings = await this.settingsRepository.getSettings();
        return this.createSuccessResult(settings);
      } catch (error) {
        return this.createErrorResult('SETTINGS_FAILED', 'Failed to get settings', { error });
      }
    });

    // Update settings
    ipcMain.handle(SETTINGS_CHANNELS.UPDATE_SETTINGS, async (_, request: UpdateSettingsIPCRequest) => {
      if (!this.isValidSettingsUpdate(request.settings)) {
        return this.createErrorResult('INVALID_SETTINGS', 'Invalid settings update');
      }

      try {
        const updatedSettings = await this.settingsRepository.updateSettings(request.settings);

        // Broadcast settings change to all windows
        this.broadcastToAllWindows(SETTINGS_CHANNELS.SETTINGS_UPDATED, updatedSettings);

        return this.createSuccessResult(updatedSettings);
      } catch (error) {
        return this.createErrorResult('UPDATE_FAILED', 'Failed to update settings', { error });
      }
    });
  }

  /**
   * Setup window management IPC channels
   */
  private setupWindowChannels(): void {
    // Create window
    ipcMain.handle(WINDOW_CHANNELS.CREATE_WINDOW, async (_, request: CreateWindowIPCRequest) => {
      if (!this.isValidCreateWindowRequest(request)) {
        return this.createErrorResult('INVALID_REQUEST', 'Invalid window creation request');
      }

      try {
        const options: any = {};
        if (request.bounds) {
          options.bounds = {
            x: request.bounds.x || 0,
            y: request.bounds.y || 0,
            width: request.bounds.width,
            height: request.bounds.height,
          };
        }
        if (request.alwaysOnTop !== undefined) {
          options.alwaysOnTop = request.alwaysOnTop;
        }

        await this.windowManager.createWindow(request.type, options);
        return this.createSuccessResult(undefined);
      } catch (error) {
        return this.createErrorResult('WINDOW_CREATION_FAILED', 'Failed to create window', { error });
      }
    });

    // Close current window
    ipcMain.handle(WINDOW_CHANNELS.CLOSE_WINDOW, async (event) => {
      try {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window) {
          window.close();
        }
        return this.createSuccessResult(undefined);
      } catch (error) {
        return this.createErrorResult('WINDOW_CLOSE_FAILED', 'Failed to close window', { error });
      }
    });

    // Other window management handlers...
    this.setupRemainingWindowChannels();
  }

  /**
   * Setup remaining window management channels
   */
  private setupRemainingWindowChannels(): void {
    // Minimize current window
    ipcMain.handle(WINDOW_CHANNELS.MINIMIZE_WINDOW, async (event) => {
      try {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window) {
          window.minimize();
        }
        return this.createSuccessResult(undefined);
      } catch (error) {
        return this.createErrorResult('WINDOW_MINIMIZE_FAILED', 'Failed to minimize window', { error });
      }
    });

    // Maximize/restore current window
    ipcMain.handle(WINDOW_CHANNELS.MAXIMIZE_WINDOW, async (event) => {
      try {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window) {
          if (window.isMaximized()) {
            window.restore();
          } else {
            window.maximize();
          }
        }
        return this.createSuccessResult(undefined);
      } catch (error) {
        return this.createErrorResult('WINDOW_MAXIMIZE_FAILED', 'Failed to maximize window', { error });
      }
    });

    // Set always on top
    ipcMain.handle(WINDOW_CHANNELS.SET_ALWAYS_ON_TOP, async (event, alwaysOnTop: boolean) => {
      try {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window) {
          window.setAlwaysOnTop(alwaysOnTop);
        }
        return this.createSuccessResult(undefined);
      } catch (error) {
        return this.createErrorResult('SET_ALWAYS_ON_TOP_FAILED', 'Failed to set always on top', { error });
      }
    });

    // Get window state
    ipcMain.handle(WINDOW_CHANNELS.GET_WINDOW_STATE, async (event) => {
      try {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (!window) {
          return this.createErrorResult('NO_WINDOW', 'No window found');
        }

        const windowState = {
          type: 'dashboard' as const, // TODO: Determine actual window type
          isVisible: window.isVisible(),
          bounds: window.getBounds(),
          alwaysOnTop: window.isAlwaysOnTop(),
        };

        return this.createSuccessResult(windowState);
      } catch (error) {
        return this.createErrorResult('WINDOW_STATE_FAILED', 'Failed to get window state', { error });
      }
    });
  }

  /**
   * Setup application-related IPC channels
   */
  private setupAppChannels(): void {
    // Quit application
    ipcMain.handle(APP_CHANNELS.QUIT, async () => {
      try {
        // Cleanup services
        this.pomodoroTimerService.cleanup?.();

        // Quit application
        const { app } = require('electron');
        app.quit();

        return this.createSuccessResult(undefined);
      } catch (error) {
        return this.createErrorResult('QUIT_FAILED', 'Failed to quit application', { error });
      }
    });

    // Get app version
    ipcMain.handle(APP_CHANNELS.GET_VERSION, async () => {
      try {
        const { app } = require('electron');
        return this.createSuccessResult(app.getVersion());
      } catch (error) {
        return this.createErrorResult('VERSION_FAILED', 'Failed to get app version', { error });
      }
    });

    // Show notification
    ipcMain.handle(APP_CHANNELS.SHOW_NOTIFICATION, async (_, request: ShowNotificationIPCRequest) => {
      if (!this.isValidNotificationRequest(request)) {
        return this.createErrorResult('INVALID_NOTIFICATION', 'Invalid notification request');
      }

      try {
        await this.notificationService.showCustomNotification(
          request.title,
          request.body,
          request.silent
        );
        return this.createSuccessResult(undefined);
      } catch (error) {
        return this.createErrorResult('NOTIFICATION_FAILED', 'Failed to show notification', { error });
      }
    });
  }

  /**
   * Setup event broadcasting for timer events
   */
  private setupEventBroadcasting(): void {
    // Subscribe to Pomodoro timer events and broadcast to all windows
    this.pomodoroTimerService.onTick((state) => {
      this.broadcastToAllWindows(TIMER_CHANNELS.TIMER_TICK, state);
    });

    this.pomodoroTimerService.onPhaseChange((fromPhase, toPhase, state) => {
      this.broadcastToAllWindows(TIMER_CHANNELS.PHASE_CHANGED, { fromPhase, toPhase, state });
    });

    this.pomodoroTimerService.onStateChange((state) => {
      this.broadcastToAllWindows(TIMER_CHANNELS.STATE_CHANGED, state);
    });
  }

  /**
   * Broadcast message to all renderer windows
   */
  private broadcastToAllWindows(channel: string, data: any): void {
    BrowserWindow.getAllWindows().forEach(window => {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, data);
      }
    });
  }

  /**
   * Convert service result to IPC result format
   */
  private convertToIPCResult<T>(result: any): IPCResult<T> {
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: {
          code: result.error.code || 'UNKNOWN_ERROR',
          message: result.error.message || 'An unknown error occurred',
          details: result.error.details,
        },
      };
    }
  }

  /**
   * Create success IPC result
   */
  private createSuccessResult<T>(data: T): IPCResult<T> {
    return { success: true, data };
  }

  /**
   * Create error IPC result
   */
  private createErrorResult(code: string, message: string, details?: Record<string, unknown>): IPCResult<never> {
    const error: IPCError = { code, message };
    if (details) {
      error.details = details;
    }

    return {
      success: false,
      error,
    };
  }

  /**
   * Validation methods
   */
  private isValidTimerConfig(config: any): config is Partial<TimerConfig> {
    if (!config || typeof config !== 'object') return false;

    // Check optional numeric properties
    const numericProps = ['planningDuration', 'focusDuration', 'breakDuration', 'longBreakDuration', 'longBreakInterval'];
    for (const prop of numericProps) {
      if (config[prop] !== undefined && (typeof config[prop] !== 'number' || config[prop] <= 0)) {
        return false;
      }
    }

    // Check optional boolean properties
    const booleanProps = ['autoStartBreaks', 'autoStartFocus'];
    for (const prop of booleanProps) {
      if (config[prop] !== undefined && typeof config[prop] !== 'boolean') {
        return false;
      }
    }

    return true;
  }

  private isValidCreateSessionRequest(request: any): request is CreateSessionIPCRequest {
    return request &&
      typeof request === 'object' &&
      typeof request.name === 'string' &&
      typeof request.duration === 'number' &&
      request.name.trim().length > 0 &&
      request.duration > 0;
  }

  private isValidSettingsUpdate(settings: any): settings is Partial<TimerSettings> {
    return settings && typeof settings === 'object';
  }

  private isValidCreateWindowRequest(request: any): request is CreateWindowIPCRequest {
    return request &&
      typeof request === 'object' &&
      typeof request.type === 'string' &&
      ['dashboard', 'floating-countdown', 'break-screen', 'planning'].includes(request.type);
  }

  private isValidNotificationRequest(request: any): request is ShowNotificationIPCRequest {
    return request &&
      typeof request === 'object' &&
      typeof request.title === 'string' &&
      typeof request.body === 'string';
  }

  /**
   * Cleanup IPC handlers
   */
  public cleanup(): void {
    // Remove all IPC handlers
    Object.values(TIMER_CHANNELS).forEach(channel => {
      ipcMain.removeAllListeners(channel);
    });

    Object.values(SETTINGS_CHANNELS).forEach(channel => {
      ipcMain.removeAllListeners(channel);
    });

    Object.values(WINDOW_CHANNELS).forEach(channel => {
      ipcMain.removeAllListeners(channel);
    });

    Object.values(APP_CHANNELS).forEach(channel => {
      ipcMain.removeAllListeners(channel);
    });
  }
}
