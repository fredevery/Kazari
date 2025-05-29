import { WindowType } from "@/shared/constants.ts";
import { BaseWindow } from "./BaseWindow.js";

export class SessionPlanningWindow extends BaseWindow {
  routerPath = "/session-planning";

  constructor() {
    super();
    this.windowLoad();
  }

  get type() {
    return WindowType.SessionPlanning;
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
