import { WindowType } from "@/shared/constants.ts";
import { BaseWindow } from "./BaseWindow.js";

export class BreakScreen extends BaseWindow {
  routerPath = "/break";

  constructor() {
    super();
    this.windowLoad();
  }

  get type() {
    return WindowType.BreakScreen;
  }

  get baseState() {
    return {
      ...super.baseState,
      isFullScreen: true,
      isVisible: false,
      alwaysOnTop: true,
    };
  }

  afterShowWindow() {
    this.window.setAlwaysOnTop(true);
  }
}
