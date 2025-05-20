import { createMainWindow } from "./windows/mainWindow.ts";
import { store, type WindowConfig, type WindowState } from "@/data/store.ts";
import { AppEvents, WindowType } from "@/shared/constants.ts";
import {
  app,
  BrowserWindow,
  screen,
  type BrowserWindowConstructorOptions,
} from "electron";

class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map();
  private configs: Map<string, WindowConfig> = new Map();

  constructor() {
    const savedStates = store.get("windows");
    Object.entries(savedStates).forEach(([id, config]) => {
      this.configs.set(id, config);
    });

    app.on(AppEvents.BeforeQuit, () => {
      this.saveAllWindowStates();
    });
  }

  private saveWindowState(id: string, window: BrowserWindow) {
    const state: WindowState = {
      bounds: window.getBounds(),
      isMaximized: window.isMaximized(),
      isFullScreen: window.isFullScreen(),
    };

    const config = this.configs.get(id);
    if (config) {
      config.state = state;
      this.configs.set(id, config);
    }
  }

  private saveAllWindowStates() {
    store.set("windows", Object.fromEntries(this.configs));
  }

  private restoreWindowState(id: string, window: BrowserWindow) {
    const config = this.configs.get(id);
    if (!config) return;

    const { bounds, isMaximized, isFullScreen } = config.state;
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const x = Math.min(Math.max(0, bounds.x), width - bounds.width);
    const y = Math.min(Math.max(0, bounds.y), height - bounds.height);

    window.setBounds({ ...bounds, x, y });
    if (isMaximized) window.maximize();
    if (isFullScreen) window.setFullScreen(true);
  }

  private setupWindowEvents(id: string, window: BrowserWindow) {
    window.on("move", () => this.saveWindowState(id, window));
    window.on("resize", () => this.saveWindowState(id, window));
    window.on("maximize", () => this.saveWindowState(id, window));
    window.on("unmaximize", () => this.saveWindowState(id, window));
    window.on("enter-full-screen", () => this.saveWindowState(id, window));
    window.on("leave-full-screen", () => this.saveWindowState(id, window));
    window.on("close", () => this.saveWindowState(id, window));
  }

  createWindow(
    type: WindowType
    // options: Partial<BrowserWindowConstructorOptions> = {}
  ) {
    const id = `${type}-${Date.now()}`;
    let window: BrowserWindow;

    switch (type) {
      case WindowType.Main:
        window = createMainWindow();
        break;
      default:
        throw new Error(`Unsupported window type: ${type}`);
    }

    this.windows.set(id, window);
    this.configs.set(id, {
      id,
      type,
      state: {
        bounds: window.getBounds(),
        isMaximized: false,
        isFullScreen: false,
      },
      isVisible: true,
    });

    this.setupWindowEvents(id, window);
    this.restoreWindowState(id, window);

    return { id, window };
  }

  getWindow(id: string) {
    return this.windows.get(id);
  }

  showWindow(id: string) {
    const window = this.windows.get(id);
    if (window) {
      window.show();

      const config = this.configs.get(id);
      if (config) {
        config.isVisible = true;
        this.configs.set(id, config);
      }
    }
  }

  hideWindow(id: string) {
    const window = this.windows.get(id);
    if (window) {
      window.hide();

      const config = this.configs.get(id);
      if (config) {
        config.isVisible = false;
        this.configs.set(id, config);
      }
    }
  }

  closeWindow(id: string) {
    const window = this.windows.get(id);
    if (window) {
      window.close();
      this.windows.delete(id);
      this.configs.delete(id);
    }
  }

  closeAllWindows() {
    this.windows.forEach(window => window.close());
    this.windows.clear();
    this.configs.clear();
  }
}

const windowManager = new WindowManager();

export function setupWindows() {
  const { id, window } = windowManager.createWindow(WindowType.Main);
  return { id, window };
}

export { windowManager };
