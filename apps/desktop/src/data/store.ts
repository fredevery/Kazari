import { z } from "zod/v4";
import Store from "electron-store";
import { WindowConfigSchema, WindowStateSchema } from "./models/Windows.ts";
import { AppConfigSchema } from "./models/AppConfig.ts";

const AppStoreSchema = z.object({
  windows: z.record(z.string(), WindowConfigSchema),
  configs: AppConfigSchema,
});
type AppStoreSchemaType = z.infer<typeof AppStoreSchema>;

export type WindowConfig = z.infer<typeof WindowConfigSchema>;
export type WindowState = z.infer<typeof WindowStateSchema>;

class AppStore {
  private schema = AppStoreSchema;
  private store: Store<AppStoreSchemaType>;

  constructor() {
    this.store = new Store<AppStoreSchemaType>({});
  }

  get(key: keyof AppStoreSchemaType) {
    return this.store.get(key, {});
  }

  set(key: keyof AppStoreSchemaType, value: any) {
    if (!this.schema.shape[key]) {
      throw new Error(`Invalid key: ${key}`);
    }
    const parsedValue = this.schema.shape[key].safeParse(value);
    if (!parsedValue.success) {
      throw new Error(`Invalid value for key ${key}: ${parsedValue.error}`);
    }
    this.store.set(key, parsedValue.data);
  }

  // STATIC PROPERTIES
  private static instance: AppStore;
  static getInstance() {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore();
    }
    return AppStore.instance;
  }
}

export const appStore = AppStore.getInstance();

export default appStore;
