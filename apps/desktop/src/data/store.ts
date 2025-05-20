import Store from "electron-store";
import { WindowType } from "../shared/constants.js";

export interface WindowState {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isMaximized: boolean;
  isFullScreen: boolean;
}

export interface WindowConfig {
  id: string;
  type: WindowType;
  state: WindowState;
  isVisible: boolean;
}

const schema = {
  windows: {
    type: "object",
    properties: {
      [WindowType.Main]: {
        type: "object",
      },
    },
  },
};

export const store = new Store<{ windows: Record<string, WindowConfig> }>({
  name: "kazari-desktop",
  schema,
  defaults: {
    windows: {},
  },
});

export default store;
