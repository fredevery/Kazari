import { WindowType } from "@/shared/enums.ts";
import { BaseWindow } from "./BaseWindow.js";

export class DailyPlanningWindow extends BaseWindow {
  routerPath = "/daily-planning";

  constructor() {
    super();
    this.windowLoad();
  }

  get type() {
    return WindowType.DailyPlanning;
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
