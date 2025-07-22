import { APP_CONFIG } from '@shared/constants/app';
import { app, BrowserWindow } from 'electron';
import { NotificationServiceImpl } from './application/services/notification-service';
import { TimerServiceImpl } from './application/services/timer-service';
import { IPCHandler } from './infrastructure/ipc-handler';
import { SettingsRepositoryImpl } from './infrastructure/repositories/settings-repository';
import { TimerRepositoryImpl } from './infrastructure/repositories/timer-repository';
import { WindowManager } from './infrastructure/window-manager';

/**
 * Main application class that orchestrates all services and handles
 * Electron application lifecycle events.
 */
class KazariApp {
  private windowManager: WindowManager;
  private ipcHandler: IPCHandler;
  private timerService: TimerServiceImpl;
  private notificationService: NotificationServiceImpl;

  constructor() {
    // Initialize repositories
    const timerRepository = new TimerRepositoryImpl();
    const settingsRepository = new SettingsRepositoryImpl();

    // Initialize services
    this.notificationService = new NotificationServiceImpl();
    this.timerService = new TimerServiceImpl(timerRepository, this.notificationService);

    // Initialize window manager
    this.windowManager = new WindowManager();

    // Initialize IPC handler
    this.ipcHandler = new IPCHandler(
      this.timerService,
      settingsRepository,
      this.windowManager,
      this.notificationService
    );
  }

  /**
   * Initialize and start the application
   */
  public async initialize(): Promise<void> {
    await this.setupElectronEvents();

    console.log(`${APP_CONFIG.NAME} ${APP_CONFIG.VERSION} started successfully`);
  }

  /**
   * Set up Electron application event handlers
   */
  private async setupElectronEvents(): Promise<void> {
    // Handle app ready event
    app.whenReady().then(async () => {
      await this.createMainWindow();
      await this.setupSecurityPolicies();
    });

    // Handle all windows closed
    app.on('window-all-closed', () => {
      // On macOS, keep the app running even when all windows are closed
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Handle app activation (macOS)
    app.on('activate', async () => {
      // On macOS, re-create a window when the dock icon is clicked
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.createMainWindow();
      }
    });

    // Handle before quit
    app.on('before-quit', () => {
      this.cleanup();
    });

    // Handle system sleep/wake events for timer accuracy
    app.on('browser-window-blur', () => {
      // Pause timer when app loses focus (optional behavior)
    });

    app.on('browser-window-focus', () => {
      // Resume timer when app gains focus (optional behavior)
    });
  }

  /**
   * Create the main dashboard window
   */
  private async createMainWindow(): Promise<void> {
    try {
      await this.windowManager.createWindow('dashboard');
    } catch (error) {
      console.error('Failed to create main window:', error);
      throw error;
    }
  }

  /**
   * Set up security policies for the application
   */
  private async setupSecurityPolicies(): Promise<void> {
    // Set Content Security Policy
    app.on('web-contents-created', (_, contents) => {
      contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        // Only allow navigation to our own pages
        if (parsedUrl.origin !== 'http://localhost:5173' && !parsedUrl.protocol.startsWith('file:')) {
          event.preventDefault();
        }
      });

      // Prevent opening external links
      contents.setWindowOpenHandler(({ url }) => {
        return { action: 'deny' };
      });
    });
  }

  /**
   * Clean up resources before application quit
   */
  private cleanup(): void {
    try {
      this.timerService.cleanup();
      this.windowManager.cleanup();
      console.log('Application cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Create and initialize the application
const kazariApp = new KazariApp();

// Initialize the application
kazariApp.initialize().catch(console.error);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  app.quit();
});

export { kazariApp };
