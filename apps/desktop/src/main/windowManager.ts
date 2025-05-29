import { screen, BrowserWindow } from "electron";

import { WindowType } from "@/shared/constants.ts";
import { logger } from "@/shared/logger.ts";

import { MainWindow } from "./windows/MainWindow.ts";
import { BreakScreen } from "./windows/BreakScreen.ts";
import { SessionPlanningWindow } from "./windows/SessionPlanning.ts";

class WindowManager {
  private static instance: WindowManager;
  private windows: Map<string, MainWindow[]> = new Map();

  static getInstance() {
    logger.info("Getting WindowManager instance");
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager();
    }
    return WindowManager.instance;
  }

  constructor() {
    logger.info("Initializing WindowManager");
  }

  setupWindows() {
    logger.info("Setting up windows");
    const mainWindows: MainWindow[] = [];
    screen.getAllDisplays().forEach((display) => {
      mainWindows.push(new MainWindow({ display }));
    });
    logger.info(`${mainWindows.length} Main Windows Created`);
    this.windows.set("mainWindows", mainWindows);
  }

  launchSessionPlanningWindow() {
    logger.info("Launching Session Planning Window");
    const sessionPlanningWindow = new SessionPlanningWindow();
    return sessionPlanningWindow;
  }

  createWindow(type: WindowType, options?: any): BrowserWindow {
    let window: BrowserWindow;
    switch (type) {
      case WindowType.BreakScreen:
        window = new BreakScreen();
        break;
      case WindowType.Main:
      default:
        window = new MainWindow(options);
    }
    if (!this.windows.has(type)) this.windows.set(type, []);
    this.windows.get(type)!.push(window);
    logger.info(`Created window of type ${type}`);
    return window;
  }
}

const windowManager = WindowManager.getInstance();
export { windowManager };
