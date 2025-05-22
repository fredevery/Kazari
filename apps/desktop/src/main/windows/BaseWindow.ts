import path from "node:path";
import { BrowserWindow, app } from "electron";
import { v4 as uuidv4 } from "uuid";
import { WindowType } from "@/shared/constants.ts";
import type { WindowState } from "@/data/store.ts";

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
export class BaseWindow {
  private window: BrowserWindow;
  private state: WindowState;
  private loadURL: string | undefined = MAIN_WINDOW_VITE_DEV_SERVER_URL;

  type: WindowType = WindowType.BaseWindow;
  id: string;

  constructor({}) {
    this.id = uuidv4();
    this.state = this.setupState();
    this.window = this.setupWindow();
    this.setupEvents();
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

    if (isDev) {
      window.webContents.openDevTools({ mode: "right" });
    }

    if (this.loadURL) {
      window.loadURL(this.loadURL);
    } else {
      window.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      );
    }

    return window;
  }

  private setupState() {
    return this.baseState;
  }

  private setupEvents() {
    this.window.on("move", () => this.saveState());
    this.window.on("resize", () => this.saveState());
    this.window.on("maximize", () => this.saveState());
    this.window.on("unmaximize", () => this.saveState());
    this.window.on("enter-full-screen", () => this.saveState());
    this.window.on("leave-full-screen", () => this.saveState());
    this.window.on("ready-to-show", () => this.showWindow());
  }

  private saveState() {
    this.state.bounds = this.window.getBounds();
    this.state.isMaximized = this.window.isMaximized();
    this.state.isFullScreen = this.window.isFullScreen();
    this.state.isVisible = this.window.isVisible();
  }
  // private restoreState() {}

  showWindow() {
    this.window.show();
  }
  hideWindow() {
    this.window.hide();
  }
  closeWindow() {
    this.window.close();
  }
}
