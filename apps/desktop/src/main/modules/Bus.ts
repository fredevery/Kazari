import { EventEmitter } from "node:events";

export class RootBus {
  private _children: Map<string, Bus> = new Map();

  public registerBus({ key, bus }: { key: string; bus: Bus }) {
    if (this._children.has(key)) {
      console.warn("A bus has already been registered with key:", key);
    }
    this._children.set(key, bus);
  }

  public deRegisterBus(key: string): void {
    if (!this._children.has(key)) {
      return;
    }
    this._children.delete(key);
  }

  public emit(
    fromKey: string,
    event: string | symbol,
    ...args: any[]
  ): boolean {
    let result = false;
    this._children.forEach((bus) => {
      if (bus.key === fromKey) return;
      const busResult = bus.handle(event, ...args);
      result = result && busResult;
    });
    return result;
  }

  public hasBus(key: string): boolean {
    return this._children.has(key);
  }
}

export class Bus extends EventEmitter {
  private _rootBus: RootBus;
  private _key: string;
  private _listeners: Map<string | symbol, Set<(...args: any[]) => void>> =
    new Map();

  get key(): string {
    return this._key;
  }

  private constructor({ key }: { key: string }) {
    if (!key) {
      throw new Error("Key is required to create a Bus instance.");
    }

    super();
    this._rootBus = Bus.getRootBus();
    this._rootBus.registerBus({ key, bus: this });
    this._key = key;
  }

  public emit(event: string | symbol, ...args: any[]): boolean {
    super.emit(event, ...args); // Emit the event to the local bus
    if (String(event).endsWith("global"))
      this._rootBus.emit(this.key, event, ...args);
    return true;
  }

  public handle(event: string | symbol, ...args: any[]): boolean {
    if (this._listeners.has(event)) {
      return super.emit(event, ...args);
    }
    return false;
  }

  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    const listeners = this._listeners.get(event) || new Set();
    if (listeners.has(listener)) {
      console.warn(`Listener for event "${event.toString()}" already exists.`);
      return this;
    }
    this._listeners.set(event, listeners.add(listener));
    super.on(event, listener);
    return this;
  }

  public off(
    event: string | symbol,
    listener?: (...args: any[]) => void,
  ): this {
    if (!this._listeners.has(event)) {
      console.warn(`No listeners found for event: ${event.toString()}`);
      return this;
    }

    if (listener) {
      const listeners = this._listeners.get(event);
      if (listeners && listeners.has(listener)) {
        listeners.delete(listener);
        super.off(event, listener); // Remove the listener from the EventEmitter
      }
    } else {
      this._listeners.delete(event);
      super.removeAllListeners(event); // Remove all listeners for the event
    }
    return this;
  }

  public reset(): this {
    this.removeAllListeners();
    this._listeners.clear();
    return this;
  }

  public destroy(): void {
    if (!Bus.isActiveBus(this._key)) return;
    this.reset();
    this._rootBus.deRegisterBus(this._key);
    Bus.removeInstance(this._key);
  }

  public hasActiveListeners(event?: string | symbol): boolean {
    if (event) {
      return (
        this._listeners.has(event) &&
        (this._listeners.get(event)?.size || 0) > 0
      );
    }
    return Array.from(this._listeners.values()).some(
      (listeners) => listeners.size > 0,
    );
  }

  // STATICS
  private static _rootBus: RootBus;
  private static _instances: Map<string, Bus> = new Map();
  public static getRootBus(): RootBus {
    if (!Bus._rootBus) {
      Bus._rootBus = new RootBus();
    }
    return Bus._rootBus;
  }

  public static getInstance(key: string): Bus {
    if (!Bus._instances.has(key)) {
      Bus._instances.set(key, new Bus({ key }));
    }
    return Bus._instances.get(key)!;
  }

  public static removeInstance(key: string): void {
    if (Bus._instances.has(key)) {
      Bus._instances.delete(key);
    } else {
      console.warn(`No instance found with key: ${key}`);
    }
  }

  public static isActiveBus(key: string): boolean {
    return Bus._instances.has(key);
  }
}
