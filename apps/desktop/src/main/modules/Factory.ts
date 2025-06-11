import { type BaseModule } from "./Base.ts";
import { Bus } from "@/main/modules/Bus.ts";

interface ModuleConstructor<T extends BaseModule> {
  new (...args: unknown[]): T;
  getInstance?: (...args: unknown[]) => T;
  setBus: (bus: Bus) => void;
}

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
