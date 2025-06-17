import { Bus, type ClassWithBus } from "@/main/core/Bus.ts";

export class BaseManager implements ClassWithBus {
  protected bus: Bus;

  constructor() {
    console.log();
    this.bus = Bus.getInstance(`${this.constructor.name}:Bus`);
    return BaseManager.resolveInstance(this);
  }

  getBus(): Bus {
    return this.bus;
  }

  // ============================ STATICS ============================
  static instance: BaseManager;
  static getInstance<T extends typeof BaseManager>(this: T): InstanceType<T> {
    return this.resolveInstance() as InstanceType<T>;
  }

  private static resolveInstance(fallback?: BaseManager): BaseManager {
    if (BaseManager.instance) {
      return BaseManager.instance;
    }
    BaseManager.instance = fallback || new this();
    return BaseManager.instance;
  }
}
