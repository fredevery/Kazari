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

export class Bus extends EventEmitter {
  private parentBus?: Bus;
  private key: string;
  private childBuses: Map<string, Bus> = new Map();
  private isRoot: boolean = false;

  private eventListenerMaps: EventListenerMaps = new Map();

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

  // canHandle(event: EventKey, fromBus?: Bus): boolean {
  //   console.log("  >", this.key, "canHandle", event, this.parentBus?.key);
  //   const canHandle =
  //     this.eventListenerMaps.has(event) ||
  //     this.getAllChildBuses()
  //       .filter((bus) => !fromBus || bus.key !== fromBus.key)
  //       .some((bus) => {
  //         return bus.canHandle(event);
  //       });

  //   console.log("  -->", this.key, canHandle);
  //   return canHandle;
  // }

  // parentCanHandle(event: EventKey): boolean {
  //   console.log("  >", this.key, "parentCanHandle", event, this.parentBus?.key);
  //   if (!this.parentBus) return false;
  //   const parentCanHandle =
  //     this.parentBus.canHandle(event, this) ||
  //     this.parentBus.parentCanHandle(event);

  //   console.log(
  //     "  -->",
  //     this.key,
  //     this.parentBus?.key,
  //     parentCanHandle,
  //     this.parentBus.canHandle(event),
  //   );

  //   return parentCanHandle;
  // }

  canHandle(event: EventKey): boolean {
    return this.eventListenerMaps.has(event);
  }

  getAllBusesForEvent(event: EventKey, exclude?: Bus): Bus[] {
    const buses: Bus[] = [];
    if (this.canHandle(event)) {
      buses.push(this);
    }
    const children = this.getChildBusesAsArray()
      .filter((bus) => !exclude || exclude.key !== bus.key)
      .flatMap((bus) => {
        return bus.getAllBusesForEvent(event, this);
      });
    buses.push(...children);

    if (this.parentBus && this.parentBus.key !== exclude?.key) {
      const siblings = this.parentBus.getAllBusesForEvent(event, this);
      buses.push(...siblings);
    }
    return buses;
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

  // handle(event: EventKey, ...args: unknown[]): boolean {
  //   if (this.canHandle(event)) {
  //     return super.emit(event, ...args);
  //   }
  //   return false;
  // }

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
      // originalMethod.__wrapped = true;
      // console.log(context, Object.keys(originalMethod));
      // context.addInitializer(function (this: This) {
      //   this.getBus().on(eventKey, (...args: Args) => {
      //     console.log(">>>", originalMethod.__wrapped);
      //     originalMethod.apply(this, args);
      //   });
      // });

      // return originalMethod;
    };
  }

  static handleRequest(requestKey: string) {
    return function requestHandlerDecorator(
      originalMethod: Function,
      context: ClassMethodDecoratorContext,
    ) {
      return function methodWrapper(this: any, ...args: any[]) {
        return originalMethod.call(this, ...args);
      };
    };
  }
}
