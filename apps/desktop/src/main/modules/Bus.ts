import { EventEmitter } from "node:events";

export class Bus extends EventEmitter {
  private static _instance: Bus;

  private constructor() {
    super();
  }

  public static getInstance(): Bus {
    if (!Bus._instance) {
      Bus._instance = new Bus();
    }
    return Bus._instance;
  }
}
