import { BaseWindow } from "./BaseWindow.ts";
import { WindowType } from "@/shared/constants.ts";

export class MainWindow extends BaseWindow {
  type = WindowType.Main;

  constructor() {
    super({});
  }

  get baseState() {
    return {
      ...super.baseState,
      isFullScreen: true,
    };
  }
}
