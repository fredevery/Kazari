import { EventEmitter } from "node:events";
import { warnIfTrue, throwIfUndefined } from "@/shared/checkUtils.ts";

export type ClassWithBus = {
  getBus: () => Bus;
};
type EventKey = string | symbol;
type ListenerKey = string | symbol;
type EventListener = (...args: unknown[]) => void;
type ListenersMap = Map<ListenerKey, EventListener>;
type EventListenerMaps = Map<EventKey, ListenersMap>;
type Getter = (...args: unknown[]) => unknown;
type GettersMap = Map<string, Getter[]>;

export class Bus extends EventEmitter {
  private parentBus?: Bus;
  private key: string;
  private childBuses: Map<string, Bus> = new Map();
  private isRoot: boolean = false;

  private eventListenerMaps: EventListenerMaps = new Map();
  private gettersMap: GettersMap = new Map();

  constructor({
    key,
    parentBus,
    isRoot,
  }: {
    key: string;
    parentBus?: Bus;
    isRoot?: boolean;
  }) {
    throwIfUndefined(key, "Bus key must be defined");
    super();
    this.key = key;
    this.isRoot = isRoot || false;
    if (!this.isRoot) {
      this.parentBus = parentBus || Bus.getRootBus();
      this.parentBus.registerBus(this);
    }
  }

  private getListenersMapForEvent(event: EventKey): ListenersMap {
    let listenersMap = this.eventListenerMaps.get(event);
    if (!listenersMap) {
      listenersMap = new Map();
      this.eventListenerMaps.set(event, listenersMap);
    }
    return listenersMap;
  }

  private getAllListeners(): EventListener[] {
    const listeners: EventListener[] = [];
    this.eventListenerMaps.forEach((listenersMap, _event) => {
      listeners.push(...Array.from(listenersMap.values()));
    });
    return listeners;
  }

  isRootBus(): boolean {
    return this.isRoot;
  }

  getKey(): string {
    return this.key;
  }

  getChildBusesAsArray(): Bus[] {
    return Array.from(this.childBuses.values());
  }

  getParentBus(): Bus | undefined {
    return this.parentBus;
  }

  registerBus(bus: Bus): void {
    throwIfUndefined(bus, "Bus must be defined");
    warnIfTrue(
      this.childBuses.has(bus.key),
      `Bus with key "${bus.key}" is already registered.`,
    );
    this.childBuses.set(bus.key, bus);
  }

  deregisterBus(key: string): void {
    this.childBuses.delete(key);
  }

  hasBus(key: string): boolean {
    return this.childBuses.has(key);
  }

  registerGetter(key: string, getter: Getter): void {
    throwIfUndefined(key, "Getter key must be defined");
    throwIfUndefined(getter, "Getter must be defined");
    warnIfTrue(
      this.gettersMap.has(key),
      `Getter with key "${key}" is already registered.`,
    );
    const getters = this.gettersMap.get(key) || [];
    getters.push(getter);
    this.gettersMap.set(key, getters);
  }

  get(key: string, ...args: unknown[]): unknown[] {
    throwIfUndefined(key, "Getter key must be defined");
    return this.getAllGettersForRequest(key, this).map((getter) =>
      getter(...args),
    );
  }

  canHandleEvent(event: EventKey): boolean {
    return this.eventListenerMaps.has(event);
  }

  getAllBusesForEvent(event: EventKey, exclude?: Bus): Bus[] {
    const buses: Bus[] = [];
    if (this.canHandleEvent(event)) {
      buses.push(this);
    }
    const childBuses = this.getChildBusesAsArray()
      .filter((bus) => !exclude || exclude.key !== bus.key)
      .flatMap((bus) => {
        return bus.getAllBusesForEvent(event, this);
      });
    buses.push(...childBuses);

    if (this.parentBus && this.parentBus.key !== exclude?.key) {
      const siblings = this.parentBus.getAllBusesForEvent(event, this);
      buses.push(...siblings);
    }
    return buses;
  }

  canHandleRequest(requestKey: string): boolean {
    return this.gettersMap.has(requestKey);
  }

  getAllGettersForRequest(requestKey: string, exclude?: Bus): Getter[] {
    const getters: Getter[] = [];
    if (this.canHandleRequest(requestKey)) {
      getters.push(...this.gettersMap.get(requestKey)!);
    }

    const childGetters = this.getChildBusesAsArray()
      .filter((bus) => !exclude || exclude.key !== bus.key)
      .flatMap((bus) => {
        return bus.getAllGettersForRequest(requestKey, this);
      });
    getters.push(...childGetters);

    if (this.parentBus && this.parentBus.key !== exclude?.key) {
      const parentGetters = this.parentBus.getAllGettersForRequest(
        requestKey,
        this,
      );
      getters.push(...parentGetters);
    }

    return getters;
  }

  emit(event: EventKey, ...args: unknown[]): boolean {
    this.getAllBusesForEvent(event).forEach((bus) => {
      bus.emitterEmit(event, ...args);
    });
    return true;
  }

  emitterEmit(event: EventKey, ...args: unknown[]): boolean {
    super.emit(event, ...args); // Emit the event to the local bus
    return true;
  }

  on(event: EventKey, listener: (...args: any[]) => void): this {
    const listenersMap = this.getListenersMapForEvent(event);
    if (listenersMap.has(listener.name)) {
      warnIfTrue(
        true,
        `Listener "${listener.name}" already exists for event "${event.toString()}"`,
      );
      super.off(event, listenersMap.get(listener.name)!);
    }
    listenersMap.set(listener.name, listener);
    super.on(event, listener);
    return this;
  }

  off(event: EventKey, listener: (...args: any[]) => void): this {
    throwIfUndefined(listener, "Listener must be defined");
    const listenersMap = this.getListenersMapForEvent(event);
    const registeredListener = listenersMap.get(listener.name);
    throwIfUndefined(
      registeredListener,
      `Listener "${listener.name}" not found for event "${event.toString()}"`,
    );

    listenersMap.delete(listener.name);
    super.off(event, listener); // Remove the listener from the EventEmitter
    return this;
  }

  offAll(event: EventKey): this {
    const listenersMap = this.getListenersMapForEvent(event);
    warnIfTrue(
      listenersMap.size === 0,
      `No listeners found for event "${event.toString()}"`,
    );
    Array.from(listenersMap.keys()).forEach((key) => {
      listenersMap.delete(key);
    });
    super.removeAllListeners(event); // Remove all listeners for the event from the EventEmitter
    return this;
  }

  reset(): this {
    this.removeAllListeners();
    this.eventListenerMaps.clear();
    this.gettersMap.clear();
    this.childBuses.forEach((bus) => {
      bus.reset();
      bus.destroy();
    });
    return this;
  }

  destroy(): void {
    if (!Bus.isActiveBus(this.key)) return;
    this.reset();
    this.parentBus?.deregisterBus(this.key);
    Bus.removeInstance(this.key);
  }

  hasActiveListeners(event?: string | symbol): boolean {
    if (event) {
      return this.getListenersMapForEvent(event).size > 0;
    }
    return this.getAllListeners().length > 0;
  }

  // ============================ STATICS ============================
  private static rootBus: Bus;
  private static instances: Map<string, Bus> = new Map();
  static getRootBus(): Bus {
    if (!Bus.rootBus) {
      Bus.rootBus = new Bus({ key: "root", isRoot: true });
    }
    return Bus.rootBus;
  }

  static getInstance(key: string, parentBus?: Bus): Bus {
    if (!Bus.instances.has(key)) {
      Bus.instances.set(key, new Bus({ key, parentBus }));
    }
    return Bus.instances.get(key)!;
  }

  static removeInstance(key: string): void {
    if (Bus.instances.has(key)) {
      Bus.instances.delete(key);
    } else {
      console.warn(`No instance found with key: ${key}`);
    }
  }

  static isActiveBus(key: string): boolean {
    return Bus.instances.has(key);
  }

  // ============================ STATIC DECORATORS ============================
  static eventHandler(eventKey: string) {
    return function eventHandlerDecorator<
      This extends ClassWithBus,
      Args extends unknown[],
      Return,
    >(
      originalMethod: (this: This, ...args: Args) => Return,
      context: ClassMethodDecoratorContext<
        This,
        (this: This, ...args: Args) => Return
      >,
    ) {
      const methodName = context.name;
      function methodWrapper(this: This, ...args: Args): Return {
        const results = originalMethod.apply(this, args);
        return results;
      }
      methodWrapper.prototype.name = methodName;

      context.addInitializer(function (this: This) {
        Object.defineProperties(methodWrapper, {
          name: {
            value: `${this.constructor.name}.${String(methodName)}`,
          },
        });
        this.getBus().on(eventKey, methodWrapper.bind(this));
      });

      return methodWrapper;
    };
  }

  static getter<Parent>(requestKey: string) {
    return function getterDecorator<
      This extends Parent & ClassWithBus,
      Args extends unknown[],
      Return,
    >(
      originalMethod: (this: This, ...args: Args) => Return,
      context: ClassMethodDecoratorContext<
        This,
        (this: This, ...args: Args) => Return
      >,
    ) {
      const methodName = context.name;
      function methodWrapper(this: This, ...args: Args): Return {
        const results = originalMethod.apply(this, args);
        return results;
      }
      methodWrapper.prototype.name = methodName;

      context.addInitializer(function (this: This) {
        Object.defineProperties(methodWrapper, {
          name: {
            value: `${this.constructor.name}.${String(methodName)}`,
          },
        });
        this.getBus().registerGetter(
          requestKey,
          methodWrapper.bind(this) as Getter,
        );
      });

      return methodWrapper;
    };
  }
}
