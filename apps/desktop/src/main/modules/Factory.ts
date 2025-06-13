import { type BaseModule } from "./BaseModule.ts";
import { Bus } from "@/main/modules/Bus.ts";

export interface ModuleConstructor<T extends typeof BaseModule> {
  new (...args: unknown[]): T;
  setBus: (bus: Bus) => void;
}

export class ModuleFactory {
  static create<T extends typeof BaseModule>(
    ModuleClass: ModuleConstructor<T>,
    ...args: unknown[]
  ): T {
    const busKey = `${ModuleClass.name}:Bus`;
    const bus = Bus.getInstance(busKey);
    ModuleClass.setBus(bus);
    return new ModuleClass(...args);
  }
}
