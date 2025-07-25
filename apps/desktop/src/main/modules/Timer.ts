import { Phase } from "./Phase.ts";
import { config } from "@/main/modules/Config.ts";
import { type PhaseType } from "@/data/models/Phase.ts";
import { BaseModule } from "@/main/base/BaseModule.ts";
import { TimerEvents } from "@/shared/enums.ts";

export class Timer extends BaseModule {
  private _tickDuration: number = 1000; // 1 second
  private _phases: Phase[] = [];
  private _currentPhaseIndex: number = -1;
  private _timerInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.loadPhasesFromConfig();
    this.setInitialPhase();
  }

  get phases() {
    return [...this._phases];
  }

  get currentPhase(): Phase {
    return this._phases[this._currentPhaseIndex] || this._phases[0];
  }

  getCurrentPhaseIndex(): number {
    return this._currentPhaseIndex;
  }

  loadPhasesFromConfig() {
    const configPhases = config.get("phases") as PhaseType[];
    configPhases.forEach((phase) => {
      this._phases.push(new Phase(phase));
    });
  }

  setInitialPhase() {
    if (this._currentPhaseIndex === -1) {
      this.setCurrentPhase(0);
    }
  }

  setCurrentPhase(phaseIndex: number) {
    this.currentPhase.setActive(false);
    this._currentPhaseIndex = phaseIndex;
    this.currentPhase.setActive(true);
    this.emit(TimerEvents.PHASE_SET, { phase: this.currentPhase });
  }

  start() {
    this.startPhase();
  }

  prepareNextPhase() {
    this.setCurrentPhase((this._currentPhaseIndex + 1) % this._phases.length);
  }

  startNextPhase() {
    this.prepareNextPhase();
    this.startPhase();
  }

  startPhase() {
    const phase = this.currentPhase;
    phase.setStartTime(Date.now());
    this._timerInterval = setInterval(this.tick.bind(this), this._tickDuration);
    this.emit(TimerEvents.PHASE_START, { phase });
  }

  tick() {
    const phase = this.currentPhase;
    this.emit(TimerEvents.TICK, { phase });
    if (phase.remainingTime <= 0 && !phase.canOverrun) {
      this.endPhase();
      this.startNextPhase();
    }
  }

  endPhase() {
    this.currentPhase.setActive(false);
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
    this.emit(TimerEvents.PHASE_END, { phase: this.currentPhase });
  }

  setTickDuration(duration: number) {
    this._tickDuration = duration;
  }

  // // STATIC PROPERTIES
  // private static instance: Timer;

  // static getInstance() {
  //   if (!Timer.instance) {
  //     Timer.instance = new Timer();
  //   }
  //   return Timer.instance;
  // }
}

const timer = Timer.getInstance();
export { timer };
