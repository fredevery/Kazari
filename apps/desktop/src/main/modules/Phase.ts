import { Phases } from "@/shared/constants.ts";

export class Phase {
  private _type: Phases = Phases.PLANNING;
  private _allocatedTime: number = 0; // in milliseconds

  constructor(type: Phases, allocatedTime: number) {
    this._type = type;
    this._allocatedTime = allocatedTime;
  }

  get allocatedTime(): number {
    return this._allocatedTime;
  }

  get type(): Phases {
    return this._type;
  }
}
