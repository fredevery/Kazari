import Store from "electron-store";
import { WindowType } from "../shared/constants.js";
import { z } from "zod/v4";

export const WindowStateSchema = z.object({
  bounds: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  isMaximized: z.boolean(),
  isFullScreen: z.boolean(),
  isVisible: z.boolean(),
});

const WindowConfigSchema = z.object({
  id: z.string(), //z.uuid({ version: "v4" }),
  type: z.enum(WindowType),
  state: WindowStateSchema,
});

const AppStoreSchema = z.object({
  windows: z.record(z.string(), WindowConfigSchema),
});

export type WindowConfig = z.infer<typeof WindowConfigSchema>;
export type WindowState = z.infer<typeof WindowStateSchema>;

class AppStore {
  private static instance: AppStore;
  private schema = {
    windows: z.record(z.string(), WindowConfigSchema),
  };
  private store: Store<{ windows: Record<string, WindowConfig> }>;

  constructor() {
    this.store = new Store<{ windows: Record<string, WindowConfig> }>({
      schema: {
        windows: z.toJSONSchema(this.schema.windows),
      },
    });
  }

  static getInstance() {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore();
    }
    return AppStore.instance;
  }
}

export const appStore = AppStore.getInstance();

export default appStore;
