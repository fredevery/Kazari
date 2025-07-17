import { BaseModule } from "@/main/base/BaseModule.ts";
import { appStore } from "@/data/stores/AppStore.ts";
import { Bus } from "@/main/core/Bus.ts";

export class Config extends BaseModule {
  private configs: Record<string, any> = {};
  constructor() {
    super();
    this.loadConfigs();
  }

  loadConfigs() {
    this.configs = appStore.get("configs");
  }

  @Bus.getter<Config>("config:get")
  get(key: string): any {
    return this.configs[key];
  }

  set(key: string, value: any): void {
    this.configs[key] = value;
    appStore.set("configs", this.configs);
  }
}

const config = Config.getInstance();
export { config };
