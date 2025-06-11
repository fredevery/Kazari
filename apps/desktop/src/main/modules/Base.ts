import { Bus } from "./Bus.ts";
import { ModuleFactory } from "./Factory.ts";

export class BaseModule {
  get bus(): Bus {
    return (this.constructor as typeof BaseModule).getBus();
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

  private static instance: any = null;
  private static bus: Bus | null = null;
  static getInstance<T extends typeof BaseModule>(
    this: T,
    ...args: unknown[]
  ): InstanceType<T> {
    if (!this.instance) {
      this.instance = ModuleFactory.create<InstanceType<T>>(
        this as any,
        ...args,
      );
    }
    return this.instance as InstanceType<T>;
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

  static test() {
    console.log(this);
  }
}
