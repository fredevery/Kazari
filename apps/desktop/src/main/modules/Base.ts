import { EventEmitter } from "events";

export class BaseModule {
  get bus(): EventEmitter {
    if (!BaseModule.bus) {
      throw new Error(
        "Event bus is not set. Please set the bus using BaseModule.setBus(bus).",
      );
    }
    return BaseModule.bus;
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

  static bus: EventEmitter | null = null;
  static setBus(bus: EventEmitter) {
    BaseModule.bus = bus;
  }
}
