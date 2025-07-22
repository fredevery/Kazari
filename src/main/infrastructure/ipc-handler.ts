import { APP_CONFIG } from '@shared/constants/app';
import {
  APP_CHANNELS,
  CreateSessionIPCRequest,
  CreateWindowIPCRequest,
  IPCResult,
  SETTINGS_CHANNELS,
  ShowNotificationIPCRequest,
  TIMER_CHANNELS,
  UpdateSettingsIPCRequest,
  WINDOW_CHANNELS,
} from '@shared/types/ipc';
import { NotificationService, SettingsRepository, TimerService, WindowType } from '@shared/types/timer';
import { ipcMain } from 'electron';
import { WindowManager } from './window-manager';

/**
 * IPC Handler
 * Handles all inter-process communication between main and renderer processes
 */
export class IPCHandler {
  constructor(
    private readonly timerService: TimerService,
    private readonly settingsRepository: SettingsRepository,
    private readonly windowManager: WindowManager,
    private readonly notificationService: NotificationService
  ) {
    this.setupTimerHandlers();
    this.setupSettingsHandlers();
    this.setupWindowHandlers();
    this.setupAppHandlers();
  }

  /**
   * Set up timer-related IPC handlers
   */
  private setupTimerHandlers(): void {
    // Create session
    ipcMain.handle(TIMER_CHANNELS.CREATE_SESSION, async (_, request: CreateSessionIPCRequest) => {
      try {
        const result = await this.timerService.createSession(request);
        return result;
      } catch (error) {
        return this.createErrorResult('TIMER_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    // Start session
    ipcMain.handle(TIMER_CHANNELS.START_SESSION, async (_, sessionId: string) => {
      try {
        const result = await this.timerService.startSession(sessionId);
        return result;
      } catch (error) {
        return this.createErrorResult('TIMER_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    // Pause session
    ipcMain.handle(TIMER_CHANNELS.PAUSE_SESSION, async (_, sessionId: string) => {
      try {
        const result = await this.timerService.pauseSession(sessionId);
        return result;
      } catch (error) {
        return this.createErrorResult('TIMER_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    // Stop session
    ipcMain.handle(TIMER_CHANNELS.STOP_SESSION, async (_, sessionId: string) => {
      try {
        const result = await this.timerService.stopSession(sessionId);
        return result;
      } catch (error) {
        return this.createErrorResult('TIMER_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    // Get current session
    ipcMain.handle(TIMER_CHANNELS.GET_CURRENT_SESSION, async () => {
      try {
        const result = await this.timerService.getCurrentSession();
        return result;
      } catch (error) {
        return this.createErrorResult('TIMER_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    // Get session history
    ipcMain.handle(TIMER_CHANNELS.GET_SESSION_HISTORY, async () => {
      try {
        const result = await this.timerService.getSessionHistory();
        return result;
      } catch (error) {
        return this.createErrorResult('TIMER_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });
  }

  /**
   * Set up settings-related IPC handlers
   */
  private setupSettingsHandlers(): void {
    // Get settings
    ipcMain.handle(SETTINGS_CHANNELS.GET_SETTINGS, async () => {
      try {
        const settings = await this.settingsRepository.getSettings();
        return this.createSuccessResult(settings);
      } catch (error) {
        return this.createErrorResult('SETTINGS_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    // Update settings
    ipcMain.handle(SETTINGS_CHANNELS.UPDATE_SETTINGS, async (_, request: UpdateSettingsIPCRequest) => {
      try {
        const settings = await this.settingsRepository.updateSettings(request.settings);

        // Broadcast settings update to all windows
        this.broadcastToAllWindows(SETTINGS_CHANNELS.SETTINGS_UPDATED, settings);

        return this.createSuccessResult(settings);
      } catch (error) {
        return this.createErrorResult('SETTINGS_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });
  }

  /**
   * Set up window-related IPC handlers
   */
  private setupWindowHandlers(): void {
    // Create window
    ipcMain.handle(WINDOW_CHANNELS.CREATE_WINDOW, async (_, request: CreateWindowIPCRequest) => {
      try {
        const options: { bounds?: { x: number; y: number; width: number; height: number }; alwaysOnTop?: boolean } = {};

        if (request.bounds) {
          options.bounds = {
            x: request.bounds.x ?? 0,
            y: request.bounds.y ?? 0,
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
        return this.createErrorResult('WINDOW_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    // Close window
    ipcMain.handle(WINDOW_CHANNELS.CLOSE_WINDOW, async (event) => {
      try {
        const { BrowserWindow } = await import('electron');
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window) {
          window.close();
        }
        return this.createSuccessResult(undefined);
      } catch (error) {
        return this.createErrorResult('WINDOW_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    // Minimize window
    ipcMain.handle(WINDOW_CHANNELS.MINIMIZE_WINDOW, async (event) => {
      try {
        const { BrowserWindow } = await import('electron');
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window) {
          window.minimize();
        }
        return this.createSuccessResult(undefined);
      } catch (error) {
        return this.createErrorResult('WINDOW_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    // Maximize window
    ipcMain.handle(WINDOW_CHANNELS.MAXIMIZE_WINDOW, async (event) => {
      try {
        const { BrowserWindow } = await import('electron');
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window) {
          if (window.isMaximized()) {
            window.unmaximize();
          } else {
            window.maximize();
          }
        }
        return this.createSuccessResult(undefined);
      } catch (error) {
        return this.createErrorResult('WINDOW_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    // Set always on top
    ipcMain.handle(WINDOW_CHANNELS.SET_ALWAYS_ON_TOP, async (event, alwaysOnTop: boolean) => {
      try {
        const { BrowserWindow } = await import('electron');
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window) {
          window.setAlwaysOnTop(alwaysOnTop);
        }
        return this.createSuccessResult(undefined);
      } catch (error) {
        return this.createErrorResult('WINDOW_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    // Get window state (would need to determine window type)
    ipcMain.handle(WINDOW_CHANNELS.GET_WINDOW_STATE, async (event) => {
      try {
        const { BrowserWindow } = await import('electron');
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window) {
          const bounds = window.getBounds();
          const state = {
            type: 'dashboard' as WindowType, // Default assumption
            isVisible: window.isVisible(),
            bounds,
            alwaysOnTop: window.isAlwaysOnTop(),
          };
          return this.createSuccessResult(state);
        }
        return this.createErrorResult('WINDOW_ERROR', 'Window not found');
      } catch (error) {
        return this.createErrorResult('WINDOW_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });
  }

  /**
   * Set up app-related IPC handlers
   */
  private setupAppHandlers(): void {
    // Quit app
    ipcMain.handle(APP_CHANNELS.QUIT, async () => {
      try {
        const { app } = await import('electron');
        app.quit();
        return this.createSuccessResult(undefined);
      } catch (error) {
        return this.createErrorResult('APP_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    // Get app version
    ipcMain.handle(APP_CHANNELS.GET_VERSION, async () => {
      try {
        return this.createSuccessResult(APP_CONFIG.VERSION);
      } catch (error) {
        return this.createErrorResult('APP_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    // Show notification
    ipcMain.handle(APP_CHANNELS.SHOW_NOTIFICATION, async (_, request: ShowNotificationIPCRequest) => {
      try {
        await this.notificationService.showCustomNotification(
          request.title,
          request.body,
          request.silent
        );
        return this.createSuccessResult(undefined);
      } catch (error) {
        return this.createErrorResult('APP_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });
  }

  /**
   * Broadcast session updates to all windows
   */
  public broadcastSessionUpdate(session: any): void {
    this.broadcastToAllWindows(TIMER_CHANNELS.SESSION_UPDATED, session);
  }

  /**
   * Broadcast session completion to all windows
   */
  public broadcastSessionCompletion(session: any): void {
    this.broadcastToAllWindows(TIMER_CHANNELS.SESSION_COMPLETED, session);
  }

  /**
   * Broadcast to all renderer processes
   */
  private broadcastToAllWindows(channel: string, data: any): void {
    const { BrowserWindow } = require('electron');
    const windows: Electron.BrowserWindow[] = BrowserWindow.getAllWindows();

    windows.forEach((window: Electron.BrowserWindow) => {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, data);
      }
    });
  }

  /**
   * Create success result
   */
  private createSuccessResult<T>(data: T): IPCResult<T> {
    return {
      success: true,
      data,
    };
  }

  /**
   * Create error result
   */
  private createErrorResult(code: string, message: string): IPCResult<never> {
    return {
      success: false,
      error: {
        code,
        message,
      },
    };
  }
}
