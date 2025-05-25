import type { Display } from "electron";
import { BaseWindow } from "./BaseWindow.ts";
import { WindowType } from "@/shared/constants.ts";
import { logger } from "@/shared/logger.ts";

export class MainWindow extends BaseWindow {
  private display: Display;

  constructor({ display }: { display: Display }) {
    super();
    this.display = display;
    logger.info(`Setting bounds for window ${this.id}:`, this.display.bounds);
    this.window.setBounds(this.display.bounds);
  }

  get type() {
    return WindowType.Main;
  }

  get baseState() {
    return {
      ...super.baseState,
      isFullScreen: true,
    };
  }

  afterShowWindow() {
    logger.info(`After showing window ${this.id}`);
    this.window.setFullScreen(true);
  }
}
