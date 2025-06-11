import { appStore } from "@/data/store.js";

export class Config {
  private _configs: Record<string, any> = {};
  constructor() {
    this.loadConfigs();
  }

  loadConfigs() {
    this._configs = appStore.get("configs");
  }

  get(key: string): any {
    return this._configs[key];
  }

  set(key: string, value: any): void {
    this._configs[key] = value;
    appStore.set("configs", this._configs);
  }

  // STATIC PROPERTIES
  private static instance: Config;

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }
}

const config = Config.getInstance();
export { config };
