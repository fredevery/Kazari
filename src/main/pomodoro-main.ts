import { app, BrowserWindow } from 'electron';
import { NotificationServiceImpl } from './application/services/notification-service';
import { PomodoroTimerServiceImpl } from './application/services/pomodoro-timer-service';
import { IPCHandler } from './infrastructure/ipc-handler';
import { TimerRepositoryImpl } from './infrastructure/repositories/pomodoro-timer-repository';
import { SettingsRepositoryImpl } from './infrastructure/repositories/settings-repository';
import { WindowManager } from './infrastructure/window-manager';

/**
 * Main Process Entry Point
 * Initializes all services and manages the application lifecycle
 */
class KazariApplication {
  private timerRepository!: TimerRepositoryImpl;
  private pomodoroTimerService!: PomodoroTimerServiceImpl;
  private notificationService!: NotificationServiceImpl;
  private settingsRepository!: SettingsRepositoryImpl;
  private windowManager!: WindowManager;
  private ipcHandler!: IPCHandler;

  /**
   * Initialize the application
   */
  public async initialize(): Promise<void> {
    // Set up application event handlers
    this.setupAppEventHandlers();

    // Wait for app to be ready
    await app.whenReady();

    // Initialize services
    await this.initializeServices();

    // Create main dashboard window
    await this.windowManager.createWindow('dashboard');

    console.log('Kazari Pomodoro Timer application initialized successfully');
  }

  /**
   * Initialize all application services
   */
  private async initializeServices(): Promise<void> {
    try {
      // Initialize repositories
      this.timerRepository = new TimerRepositoryImpl();
      await this.timerRepository.initialize();

      this.settingsRepository = new SettingsRepositoryImpl();
      await this.settingsRepository.initialize();

      // Initialize services
      this.notificationService = new NotificationServiceImpl();

      this.pomodoroTimerService = new PomodoroTimerServiceImpl(
        this.timerRepository,
        this.notificationService
      );
      await this.pomodoroTimerService.initialize();

      // Initialize window manager
      this.windowManager = new WindowManager();

      // Initialize IPC handlers (use existing handler for now)
      // TODO: Replace with PomodoroIPCHandler once legacy compatibility is resolved
      this.ipcHandler = new IPCHandler(
        this.pomodoroTimerService as any, // Cast for compatibility
        this.settingsRepository,
        this.windowManager,
        this.notificationService
      );

      console.log('All services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize services:', error);
      app.quit();
    }
  }

  /**
   * Setup application-level event handlers
   */
  private setupAppEventHandlers(): void {
    // Handle app activation (macOS)
    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.windowManager.createWindow('dashboard');
      }
    });

    // Handle all windows closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Handle app before quit
    app.on('before-quit', () => {
      this.cleanup();
    });

    // Handle second instance (single instance enforcement)
    if (!app.requestSingleInstanceLock()) {
      app.quit();
      return;
    }

    app.on('second-instance', () => {
      // Focus existing window if someone tries to run another instance
      const windows = BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        const mainWindow = windows[0];
        if (mainWindow) {
          if (mainWindow.isMinimized()) {
            mainWindow.restore();
          }
          mainWindow.focus();
        }
      }
    });

    // Security: Prevent new window creation from renderer
    app.on('web-contents-created', (_, contents) => {
      contents.setWindowOpenHandler(() => {
        console.warn('Prevented new window creation from renderer');
        return { action: 'deny' };
      });
    });
  }

  /**
   * Cleanup resources before app quit
   */
  private cleanup(): void {
    try {
      this.pomodoroTimerService?.cleanup();
      console.log('Application cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Create and initialize the application
const kazariApp = new KazariApplication();
kazariApp.initialize().catch((error) => {
  console.error('Failed to initialize application:', error);
  app.quit();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
});
