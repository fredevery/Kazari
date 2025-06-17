import { Bus } from "@/main/core/Bus.ts";
import { BaseManager } from "@/main/base/BaseManager.ts";
import { Phases } from "@/shared/enums.ts";
import { PlanningWindow } from "./PlanningWindow.ts";

type Windows = PlanningWindow;

export class WindowManager extends BaseManager {
  private currentWindow: Windows | null = null;

  constructor() {
    super();
  }

  @Bus.eventHandler("app:ready")
  launchStartupWindows() {
    this.launchWindowForPhase(this.getCurrentPhase());
  }

  getCurrentPhase(): Phases {
    return Phases.PLANNING;
  }

  getCurrentWindow(): Windows | null {
    return this.currentWindow;
  }

  launchWindowForPhase(phase: Phases) {
    switch (phase) {
      case Phases.PLANNING:
        this.currentWindow = new PlanningWindow();
        break;
    }
  }
}
