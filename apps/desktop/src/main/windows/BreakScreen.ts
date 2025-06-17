import { WindowType } from "@/shared/enums.ts";
import { BaseWindow } from "./BaseWindow.js";

export class BreakScreen extends BaseWindow {
  static type = WindowType.BreakScreen;
  static routerPath = "/break";

  constructor() {
    super();
    this.windowLoad();
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
