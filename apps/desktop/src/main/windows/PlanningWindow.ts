import { WindowType } from "@/shared/enums.ts";
import { BaseWindow } from "./BaseWindow.ts";

export class PlanningWindow extends BaseWindow {
  static type = WindowType.PLANNING;
  static routerPath = "/planning";
  static get baseState() {
    return {
      ...super.baseState,
      isFullScreen: true,
      isVisible: false,
      alwaysOnTop: true,
    };
  }

  constructor() {
    super();
    this.windowLoad();
  }
}
