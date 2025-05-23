import type { Display } from "electron";
import { BaseWindow } from "./BaseWindow.ts";
import { WindowType } from "@/shared/constants.ts";

export class MainWindow extends BaseWindow {
  private display: Display;
  type = WindowType.Main;

  constructor({ display }: { display: Display }) {
    super();
    this.display = display;
    this.window.setBounds(this.display.bounds);
    this.window.setFullScreen(true);
  }
}
