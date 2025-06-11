import { Phases } from "@/shared/enums.ts";

type PhaseConfig = {
  type: Phases;
  allocatedTime: number;
  canOverrun?: boolean;
};

export class Phase {
  private config: PhaseConfig = {
    type: Phases.PLANNING,
    allocatedTime: 0,
    canOverrun: false,
  };
  private startTime: number = 0;
  private isActive: boolean = false;

  constructor(phaseConfig: PhaseConfig) {
    this.config = phaseConfig;
  }

  get type(): Phases {
    return this.config.type;
  }

  get allocatedTime(): number {
    return this.config.allocatedTime;
  }

  get endTime(): number {
    return this.startTime ? this.startTime + this.allocatedTime : 0;
  }

  get remainingTime(): number {
    if (!this.startTime || !this.isActive) return 0;
    return this.allocatedTime - this.elapsedTime;
  }

  get elapsedTime(): number {
    if (!this.startTime || !this.isActive) return 0;
    return Date.now() - this.startTime;
  }

  get canOverrun(): boolean {
    return this.config.canOverrun ?? false;
  }

  getStartTime(): number {
    return this.startTime;
  }

  setStartTime(startTime: number) {
    this.startTime = startTime;
  }

  setActive(isActive: boolean) {
    this.isActive = isActive;
  }
}
