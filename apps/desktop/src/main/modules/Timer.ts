import { ipcMain } from "electron";
import { Phases, TimerActions } from "@/shared/constants.ts";
import { Phase } from "./Phase.ts";

interface TimerState {
  currentPhase: Phases;
  timeStarted: number;
  timeRemaining: number;
  allocatedTime: number;
  isRunning: boolean;
}

interface TimerPhase {
  phase: Phases;
  duration: number; // in milliseconds
  isActive: boolean;
  startTime?: number; // timestamp when the phase started
  endTime?: number; // timestamp when the phase ended
  timeRemaining?: number; // time remaining in the phase
}

const phases = [
  new Phase(Phases.PLANNING, 0),
  new Phase(Phases.FOCUS, 25 * 60 * 1000), // 25 minutes
  new Phase(Phases.BREAK, 5 * 60 * 1000), // 5 minutes
];

export class Timer {
  private static instance: Timer;
  private state: TimerState = {
    currentPhase: Phases.PLANNING,
    timeStarted: 0,
    timeRemaining: 0,
    isRunning: false,
    allocatedTime: 0,
  };

  private timerInterval: NodeJS.Timeout | null = null;

  static getInstance() {
    if (!Timer.instance) {
      Timer.instance = new Timer();
    }
    return Timer.instance;
  }

  constructor() {
    this.setupIpc();
  }

  setupIpc() {
    ipcMain.handle("timer:getStart", () => {});
    ipcMain.on("timer:control", (_event, action: TimerActions) =>
      this.handleAction(action),
    );
  }

  startPhase(phase: Phases) {}

  private handleAction(action: TimerActions) {
    switch (action) {
      case TimerActions.START:
        this.startTimer();
        break;
      case TimerActions.PAUSE:
        this.pauseTimer();
        break;
      case TimerActions.RESUME:
        this.resumeTimer();
        break;
      case TimerActions.STOP:
        this.stopTimer();
        break;
    }
  }

  private startTimer() {
    if (this.state.isRunning) return;
    this.state.isRunning = true;
    this.state.timeStarted = Date.now();
    this.state.timeRemaining = 0; // Set to desired duration in milliseconds
    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }
  private pauseTimer() {}
  private resumeTimer() {}
  private stopTimer() {}
  private tick() {
    if (!this.state.isRunning) return;
    const elapsed = Date.now() - this.state.timeStarted;
    this.state.timeRemaining = this.state.allocatedTime - elapsed;
    this.updateState();
  }

  private updateState() {}
}
