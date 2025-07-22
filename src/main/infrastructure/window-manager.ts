import { WINDOW_CONFIG } from '@shared/constants/app';
import { WindowState, WindowType } from '@shared/types/timer';
import { BrowserWindow, screen, app } from 'electron';
import * as path from 'path';

/**
 * Window Manager
 * Handles creation and management of all application windows
 */
export class WindowManager {
  private windows: Map<WindowType, BrowserWindow> = new Map();
  private isDevelopment = process.env['NODE_ENV'] === 'development';

  /**
   * Create a window of the specified type
   */
  public async createWindow(type: WindowType, options?: {
    bounds?: { x: number; y: number; width: number; height: number };
    alwaysOnTop?: boolean;
  }): Promise<BrowserWindow> {
    // Close existing window of the same type
    const existingWindow = this.windows.get(type);
    if (existingWindow && !existingWindow.isDestroyed()) {
      existingWindow.close();
    }

    const windowConfig = this.getWindowConfig(type);
    const preloadPath = this.isDevelopment 
      ? path.join(app.getAppPath(), 'dist/preload/index.js')
      : path.join(__dirname, '../preload/index.js');
    
    const browserWindowOptions: Electron.BrowserWindowConstructorOptions = {
      ...windowConfig,
      ...options?.bounds,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: preloadPath,
        webSecurity: true,
      },
    };

    if (options?.alwaysOnTop !== undefined) {
      browserWindowOptions.alwaysOnTop = options.alwaysOnTop;
    }

    const window = new BrowserWindow(browserWindowOptions);

    // Store window reference
    this.windows.set(type, window);

    // Load the appropriate content
    await this.loadWindowContent(window, type);

    // Set up window event handlers
    this.setupWindowEvents(window, type);

    // Make sure window is visible and focused
    window.show();
    window.focus();

    // Open DevTools in development mode
    if (this.isDevelopment) {
      window.webContents.openDevTools();
    }

    return window;
  }

  /**
   * Get window by type
   */
  public getWindow(type: WindowType): BrowserWindow | null {
    const window = this.windows.get(type);
    return window && !window.isDestroyed() ? window : null;
  }

  /**
   * Close window by type
   */
  public closeWindow(type: WindowType): void {
    const window = this.windows.get(type);
    if (window && !window.isDestroyed()) {
      window.close();
    }
  }

  /**
   * Close all windows
   */
  public closeAllWindows(): void {
    for (const [type, window] of this.windows) {
      if (!window.isDestroyed()) {
        window.close();
      }
    }
    this.windows.clear();
  }

  /**
   * Get window state
   */
  public getWindowState(type: WindowType): WindowState | null {
    const window = this.getWindow(type);
    if (!window) {
      return null;
    }

    const bounds = window.getBounds();
    return {
      type,
      isVisible: window.isVisible(),
      bounds,
      alwaysOnTop: window.isAlwaysOnTop(),
    };
  }

  /**
   * Set window always on top
   */
  public setAlwaysOnTop(type: WindowType, alwaysOnTop: boolean): void {
    const window = this.getWindow(type);
    if (window) {
      window.setAlwaysOnTop(alwaysOnTop);
    }
  }

  /**
   * Get window configuration for a specific type
   */
  private getWindowConfig(type: WindowType): Electron.BrowserWindowConstructorOptions {
    const display = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;

    switch (type) {
      case 'dashboard':
        return {
          width: WINDOW_CONFIG.DASHBOARD.WIDTH,
          height: WINDOW_CONFIG.DASHBOARD.HEIGHT,
          minWidth: WINDOW_CONFIG.DASHBOARD.MIN_WIDTH,
          minHeight: WINDOW_CONFIG.DASHBOARD.MIN_HEIGHT,
          x: Math.floor((screenWidth - WINDOW_CONFIG.DASHBOARD.WIDTH) / 2),
          y: Math.floor((screenHeight - WINDOW_CONFIG.DASHBOARD.HEIGHT) / 2),
          show: true,
          resizable: true,
          maximizable: true,
          minimizable: true,
          closable: true,
          alwaysOnTop: false,
          title: 'Kazari - Timer Dashboard',
        };

      case 'floating-countdown':
        return {
          width: WINDOW_CONFIG.FLOATING_COUNTDOWN.WIDTH,
          height: WINDOW_CONFIG.FLOATING_COUNTDOWN.HEIGHT,
          minWidth: WINDOW_CONFIG.FLOATING_COUNTDOWN.MIN_WIDTH,
          minHeight: WINDOW_CONFIG.FLOATING_COUNTDOWN.MIN_HEIGHT,
          x: screenWidth - WINDOW_CONFIG.FLOATING_COUNTDOWN.WIDTH - 20,
          y: 20,
          show: true,
          resizable: false,
          maximizable: false,
          minimizable: true,
          closable: true,
          alwaysOnTop: true,
          frame: false,
          title: 'Kazari - Timer',
          skipTaskbar: true,
        };

      case 'break-screen':
        return {
          width: screenWidth,
          height: screenHeight,
          x: 0,
          y: 0,
          show: true,
          resizable: false,
          maximizable: false,
          minimizable: false,
          closable: true,
          alwaysOnTop: true,
          fullscreen: true,
          frame: false,
          title: 'Kazari - Break Time',
        };

      case 'planning':
        return {
          width: WINDOW_CONFIG.PLANNING.WIDTH,
          height: WINDOW_CONFIG.PLANNING.HEIGHT,
          minWidth: WINDOW_CONFIG.PLANNING.MIN_WIDTH,
          minHeight: WINDOW_CONFIG.PLANNING.MIN_HEIGHT,
          x: Math.floor((screenWidth - WINDOW_CONFIG.PLANNING.WIDTH) / 2),
          y: Math.floor((screenHeight - WINDOW_CONFIG.PLANNING.HEIGHT) / 2),
          show: true,
          resizable: true,
          maximizable: true,
          minimizable: true,
          closable: true,
          alwaysOnTop: false,
          title: 'Kazari - Planning',
        };

      default:
        throw new Error(`Unknown window type: ${type}`);
    }
  }

  /**
   * Load content for the window
   */
  private async loadWindowContent(window: BrowserWindow, type: WindowType): Promise<void> {
    const baseUrl = this.isDevelopment
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../renderer/index.html')}`;

    // Add window type as a query parameter to help renderer identify its role
    const url = `${baseUrl}?window=${type}`;

    try {
      await window.loadURL(url);
    } catch (error) {
      console.error(`Failed to load window content for ${type}:`, error);
      throw error;
    }
  }

  /**
   * Set up window event handlers
   */
  private setupWindowEvents(window: BrowserWindow, type: WindowType): void {
    window.on('closed', () => {
      this.windows.delete(type);
    });

    window.on('unresponsive', () => {
      console.warn(`Window ${type} became unresponsive`);
    });

    window.on('responsive', () => {
      console.log(`Window ${type} became responsive again`);
    });

    // Prevent external navigation
    window.webContents.on('will-navigate', (event, url) => {
      if (!url.startsWith('http://localhost:5173') && !url.startsWith('file://')) {
        event.preventDefault();
      }
    });

    // Prevent new window creation
    window.webContents.setWindowOpenHandler(() => {
      return { action: 'deny' };
    });
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.closeAllWindows();
  }
}
