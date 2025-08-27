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
import { createLogger } from '../shared/logger';
import { WindowManager } from './window-manager';

/**
 * Centralized IPC Manager for secure channel registration
 */
export type IPCChannelConfig<T = any, R = any> = {
  name: string;
  direction: 'main-to-renderer' | 'renderer-to-main' | 'bidirectional';
  validator: (data: unknown) => boolean;
  sanitizer?: (data: any) => T;
  handler: (data: T) => Promise<R> | R;
  timeoutMs?: number; // Optional timeout for long-running handlers
};

export class IPCManager {
  private readonly logger = createLogger('IPCManager');
  private allowedChannels: Set<string> = new Set();
  private validationRules: Record<string, (data: unknown) => boolean> = {};
  private sanitizers: Record<string, (data: any) => any> = {};
  private rateLimits: Record<string, { lastCall: number; minIntervalMs: number }> = {};

  registerChannel<T, R>(config: IPCChannelConfig<T, R>) {
    this.allowedChannels.add(config.name);
    this.validationRules[config.name] = config.validator;
    if (config.sanitizer) this.sanitizers[config.name] = config.sanitizer;
    this.logger.info('Registered IPC channel', { channel: config.name, direction: config.direction });
    ipcMain.handle(config.name, async (event, rawData) => {
      try {
        // Basic allowlist check (defense in depth)
        if (!this.allowedChannels.has(config.name)) {
          this.logger.warn('Blocked non-allowlisted channel', { channel: config.name });
          return {
            success: false,
            error: { code: 'CHANNEL_NOT_ALLOWED', message: `Channel not allowed: ${config.name}` }
          };
        }

        // Simple per-channel rate limiting
        const now = Date.now();
        // Default simple rate limit: 20ms between calls per channel (can be tuned per channel if needed)
        if (!this.rateLimits[config.name]) {
          this.rateLimits[config.name] = { lastCall: 0, minIntervalMs: 20 };
        }
        const rl = this.rateLimits[config.name]!;
        if (now - rl.lastCall < rl.minIntervalMs) {
          this.logger.warn('Rate limited IPC call', { channel: config.name });
          return {
            success: false,
            error: { code: 'RATE_LIMITED', message: `Too many requests to ${config.name}` }
          };
        }
        rl.lastCall = now;

        // Validate
        if (!this.validationRules[config.name]!(rawData)) {
          this.logger.warn('IPC validation failed', { channel: config.name });
          return {
            success: false,
            error: { code: 'VALIDATION_ERROR', message: `Invalid data for channel ${config.name}` }
          };
        }
        // Sanitize
        const data = config.sanitizer ? config.sanitizer(rawData) : rawData;
        // Handle with optional timeout
        const handlerPromise = Promise.resolve(config.handler(data));
        const result = await (config.timeoutMs && config.timeoutMs > 0
          ? Promise.race([
            handlerPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('IPC_TIMEOUT')), config.timeoutMs))
          ])
          : handlerPromise);
        return { success: true, data: result };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const code = message === 'IPC_TIMEOUT' ? 'IPC_TIMEOUT' : 'IPC_ERROR';
        this.logger.error('IPC handler error', { channel: config.name, code, message });
        return {
          success: false,
          error: { code, message }
        };
      }
    });
  }
}
/**
 * IPC Handler
 * Handles all inter-process communication between main and renderer processes
 */
export class IPCHandler {
  private ipcManager: IPCManager;
  private timerService: TimerService;
  private settingsRepository: SettingsRepository;
  private windowManager: WindowManager;
  private notificationService: NotificationService;

  constructor(
    timerService: TimerService,
    settingsRepository: SettingsRepository,
    windowManager: WindowManager,
    notificationService: NotificationService
  ) {
    this.timerService = timerService;
    this.settingsRepository = settingsRepository;
    this.windowManager = windowManager;
    this.notificationService = notificationService;
    this.ipcManager = new IPCManager();
    this.setupTimerHandlers();
    this.setupSettingsHandlers();
    this.setupWindowHandlers();
    this.setupAppHandlers();
  }

  private setupTimerHandlers(): void {
    this.ipcManager.registerChannel<CreateSessionIPCRequest, any>({
      name: TIMER_CHANNELS.CREATE_SESSION,
      direction: 'renderer-to-main',
      validator: (data) => {
        if (!data || typeof data !== 'object') return false;
        const d = data as Partial<CreateSessionIPCRequest>;
        return typeof d.name === 'string' && typeof d.duration === 'number';
      },
      sanitizer: (data) => ({ name: String(data.name).trim(), duration: Number(data.duration) }),
      handler: async (request) => await this.timerService.createSession(request as any)
    });
    this.ipcManager.registerChannel<string, any>({
      name: TIMER_CHANNELS.START_SESSION,
      direction: 'renderer-to-main',
      validator: (data) => typeof data === 'string' && data.length > 0,
      handler: async (sessionId) => await this.timerService.startSession(sessionId)
    });
    this.ipcManager.registerChannel<string, any>({
      name: TIMER_CHANNELS.PAUSE_SESSION,
      direction: 'renderer-to-main',
      validator: (data) => typeof data === 'string' && data.length > 0,
      handler: async (sessionId) => await this.timerService.pauseSession(sessionId)
    });
    this.ipcManager.registerChannel<string, any>({
      name: TIMER_CHANNELS.STOP_SESSION,
      direction: 'renderer-to-main',
      validator: (data) => typeof data === 'string' && data.length > 0,
      handler: async (sessionId) => await this.timerService.stopSession(sessionId)
    });
    this.ipcManager.registerChannel<void, any>({
      name: TIMER_CHANNELS.GET_CURRENT_SESSION,
      direction: 'renderer-to-main',
      validator: () => true,
      handler: async () => await this.timerService.getCurrentSession()
    });
    this.ipcManager.registerChannel<void, any>({
      name: TIMER_CHANNELS.GET_SESSION_HISTORY,
      direction: 'renderer-to-main',
      validator: () => true,
      handler: async () => await this.timerService.getSessionHistory()
    });
  }

  private setupSettingsHandlers(): void {
    this.ipcManager.registerChannel<void, any>({
      name: SETTINGS_CHANNELS.GET_SETTINGS,
      direction: 'renderer-to-main',
      validator: () => true,
      handler: async () => await this.settingsRepository.getSettings()
    });
    this.ipcManager.registerChannel<UpdateSettingsIPCRequest, any>({
      name: SETTINGS_CHANNELS.UPDATE_SETTINGS,
      direction: 'renderer-to-main',
      validator: (data) => {
        if (!data || typeof data !== 'object') return false;
        return typeof (data as any).settings === 'object';
      },
      sanitizer: (data) => ({ settings: data.settings }),
      handler: async (request) => {
        const settings = await this.settingsRepository.updateSettings(request.settings);
        this.broadcastToAllWindows(SETTINGS_CHANNELS.SETTINGS_UPDATED, settings);
        return settings;
      }
    });
  }
  private setupWindowHandlers(): void {
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
    ipcMain.handle(APP_CHANNELS.QUIT, async () => {
      try {
        const { app } = await import('electron');
        app.quit();
        return this.createSuccessResult(undefined);
      } catch (error) {
        return this.createErrorResult('APP_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });
    ipcMain.handle(APP_CHANNELS.GET_VERSION, async () => {
      try {
        return this.createSuccessResult(APP_CONFIG.VERSION);
      } catch (error) {
        return this.createErrorResult('APP_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    });
    ipcMain.handle(APP_CHANNELS.SHOW_NOTIFICATION, async (_: any, request: ShowNotificationIPCRequest) => {
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
