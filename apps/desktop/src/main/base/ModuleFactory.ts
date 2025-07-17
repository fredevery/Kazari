import type { BaseModule, ModuleConstructor } from "./BaseModule.ts";
import { Bus } from "@/main/core/Bus.ts";

export class ModuleFactory {
  static create<T extends BaseModule>(
    ModuleClass: ModuleConstructor<T>,
    ...args: unknown[]
  ): T {
    const busKey = `${ModuleClass.name}:Bus`;
    const bus = Bus.getInstance(busKey);
    ModuleClass.setBus(bus);
    return new ModuleClass(...args);
  }
}
