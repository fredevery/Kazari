import { Phases } from "@/shared/constants.ts";
import { Phase } from "./Phase.ts";
import { config } from "@/main/modules/Config.ts";
import { type PhaseType } from "@/data/models/Phase.ts";

export class Timer {
  private _tickDuration: number = 1000; // 1 second
  private _phases: Phase[] = [];
  private _currentPhaseIndex: number = -1;
  private _timerInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadPhasesFromConfig();
    this.setInitialPhase();
  }

  get phases() {
    return [...this._phases];
  }

  get currentPhase(): Phase {
    return this._phases[this._currentPhaseIndex] || this._phases[0];
  }

  loadPhasesFromConfig() {
    const configPhases = config.get("phases") as PhaseType[];
    configPhases.forEach((phase) => {
      this._phases.push(new Phase(phase));
    });
  }

  setInitialPhase() {
    if (this._currentPhaseIndex === -1) {
      this._currentPhaseIndex = 0;
    }
  }

  setCurrentPhase(phaseIndex: number) {
    this._currentPhaseIndex = phaseIndex;
  }

  start() {
    if (this._currentPhaseIndex === -1) {
      this.setInitialPhase();
    }
    this.startPhase();
  }

  startNextPhase() {}

  startPhase() {
    const phase = this.currentPhase;
    phase.setStartTime(Date.now());
    phase.setActive(true);
    this._timerInterval = setInterval(() => {
      if (phase.remainingTime <= 0 && !phase.canOverrun) {
        this.endPhase(phase);
      }
    }, this._tickDuration);
  }

  endPhase(phase: Phase) {
    phase.setActive(false);

    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  }

  setTickDuration(duration: number) {
    this._tickDuration = duration;
  }

  // STATIC PROPERTIES
  private static instance: Timer;

  static getInstance() {
    if (!Timer.instance) {
      Timer.instance = new Timer();
    }
    return Timer.instance;
  }
}

const timer = Timer.getInstance();
export { timer };

// export class Timer {
//   private static instance: Timer;
//   private state: TimerState = {
//     currentPhase: Phases.PLANNING,
//     timeStarted: 0,
//     remainingTime: 0,
//     isRunning: false,
//     allocatedTime: 0,
//   };

//   private timerInterval: NodeJS.Timeout | null = null;

//   static getInstance() {
//     if (!Timer.instance) {
//       Timer.instance = new Timer();
//     }
//     return Timer.instance;
//   }

//   constructor() {
//     this.setupIpc();
//   }

//   setupIpc() {
//     ipcMain.handle("timer:getStart", () => {});
//     ipcMain.on("timer:control", (_event, action: TimerActions) =>
//       this.handleAction(action),
//     );
//   }

//   startPhase(phase: Phases) {}

//   private handleAction(action: TimerActions) {
//     switch (action) {
//       case TimerActions.START:
//         this.startTimer();
//         break;
//       case TimerActions.PAUSE:
//         this.pauseTimer();
//         break;
//       case TimerActions.RESUME:
//         this.resumeTimer();
//         break;
//       case TimerActions.STOP:
//         this.stopTimer();
//         break;
//     }
//   }

//   private startTimer() {
//     if (this.state.isRunning) return;
//     this.state.isRunning = true;
//     this.state.timeStarted = Date.now();
//     this.state.remainingTime = 0; // Set to desired duration in milliseconds
//     this.timerInterval = setInterval(() => {
//       this.tick();
//     }, 1000);
//   }
//   private pauseTimer() {}
//   private resumeTimer() {}
//   private stopTimer() {}
//   private tick() {
//     if (!this.state.isRunning) return;
//     const elapsed = Date.now() - this.state.timeStarted;
//     this.state.remainingTime = this.state.allocatedTime - elapsed;
//     this.updateState();
//   }

//   private updateState() {}
// }
