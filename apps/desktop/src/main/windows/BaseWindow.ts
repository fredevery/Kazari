import path from "node:path";
import { BrowserWindow } from "electron";
import { v4 as uuidv4 } from "uuid";
import { WindowType, isDev } from "@/shared/constants.ts";
import type { WindowState } from "@/data/store.ts";
import { logger } from "@/shared/logger.ts";

export class BaseWindow {
  private state: WindowState;
  private loadURL: string | undefined = MAIN_WINDOW_VITE_DEV_SERVER_URL;

  id: string;
  window: BrowserWindow;
  routerPath: string = "/";

  constructor() {
    this.id = `${this.type}-${uuidv4()}`;
    logger.info(`Creating new ${this.type} window with ID: ${this.id}`);

    this.state = this.setupState();
    this.window = this.setupWindow();
    this.setupEvents();
  }

  get type() {
    return WindowType.BaseWindow;
  }

  get baseState() {
    return {
      bounds: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      isMaximized: false,
      isFullScreen: false,
      isVisible: false,
    };
  }

  private setupWindow() {
    console.log("setupWindow", this.state);
    const window = new BrowserWindow({
      fullscreen: this.state.isFullScreen,
      show: this.state.isVisible,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    return window;
  }

  windowLoad() {
    if (this.loadURL) {
      const loadPath = `${this.loadURL}#${this.routerPath}`;
      logger.info(`Loading URL for window ${this.id}:`, loadPath);
      this.window.loadURL(loadPath);
    } else {
      logger.warn(`No URL to load for window ${this.id}`);
    }

    if (isDev) {
      this.window.webContents.openDevTools({ mode: "right" });
    }
  }

  private setupState() {
    return this.baseState;
  }

  private setupEvents() {
    logger.info(`Setting up events for window ${this.id}`);
    this.window.on("move", () => this.saveState());
    this.window.on("resize", () => this.saveState());
    this.window.on("maximize", () => this.saveState());
    this.window.on("unmaximize", () => this.saveState());
    this.window.on("enter-full-screen", () => this.saveState());
    this.window.on("leave-full-screen", () => this.saveState());
    this.window.on("ready-to-show", () => {
      logger.info(`Window ${this.id} ready to show`);
      this.showWindow();
    });

    this.window.webContents.on(
      "did-fail-load",
      (_event, errorCode, errorDescription) => {
        logger.error(
          `Window ${this.id} failed to load: ${errorDescription} (${errorCode})`,
        );
      },
    );
  }

  private saveState() {
    const newState = {
      bounds: this.window.getBounds(),
      isMaximized: this.window.isMaximized(),
      isFullScreen: this.window.isFullScreen(),
      isVisible: this.window.isVisible(),
    };

    if (JSON.stringify(newState) !== JSON.stringify(this.state)) {
      logger.debug(`Window ${this.id} state updated:`, newState);
      this.state = newState;
    }
  }
  // private restoreState() {}

  showWindow() {
    logger.info(`Showing window ${this.id}`);
    this.window.show();
    this.afterShowWindow();
  }

  afterShowWindow() {
    logger.info(`After showing window ${this.id}`);
  }

  hideWindow() {
    logger.info(`Hiding window ${this.id}`);
    this.window.hide();
  }
  closeWindow() {
    logger.info(`Closing window ${this.id}`);
    this.window.close();
  }
}
