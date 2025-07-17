import { Bus } from "@/main/core/Bus.ts";
import { ModuleFactory } from "@/main/base/ModuleFactory.ts";

export interface ModuleConstructor<T extends BaseModule> {
  new (...args: unknown[]): T;
  instance?: T | null;
  setBus: (bus: Bus) => void;
}

export class BaseModule {
  protected bus: Bus;

  constructor() {
    this.bus = Bus.getInstance(`${this.constructor.name}:Bus`);
  }

  getBus(): Bus {
    return this.bus;
  }

  emit(event: string, ...args: any[]) {
    this.bus.emit(event, ...args);
  }

  on(event: string, listener: (...args: any[]) => void) {
    this.bus.on(event, listener);
  }

  off(event: string, listener: (...args: any[]) => void) {
    this.bus.off(event, listener);
  }

  destroy() {
    this.bus?.destroy();
  }

  // STATIC PROPERTIES
  private static instance: BaseModule;
  private static bus: Bus | null = null;
  static getInstance<T extends BaseModule>(
    this: ModuleConstructor<T>,
    ...args: unknown[]
  ): T {
    const ModuleClass = this;
    if (!this.instance) {
      this.instance = ModuleFactory.create<T>(ModuleClass, ...args);
    }
    return this.instance;
  }

  static setBus(bus: Bus) {
    this.bus = bus;
  }

  static getBus(): Bus {
    if (!this.bus) {
      throw new Error(
        "Bus is not set. Please set the bus using BaseModule.setBus(bus).",
      );
    }
    return this.bus;
  }
}
