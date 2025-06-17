import { vi, beforeAll, afterAll } from "vitest";
import appConfigs from "./fixtures/appConfigs.json" with { type: "json" };

vi.stubGlobal("MAIN_WINDOW_VITE_DEV_SERVER_URL", "http://localhost:3000");

vi.mock("electron", () => ({
  app: {
    isPackaged: false,
    getPath: (pathName: string) => {
      if (pathName === "userData") {
        return "/mock/user/data/path";
      }
      return "";
    },
  },
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    emit: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
    once: vi.fn(),
    listeners: vi.fn(() => []),
    eventNames: vi.fn(() => []),
  },
  BrowserWindow: vi.fn(() => {
    return {
      on: vi.fn(),
      webContents: {
        on: vi.fn(),
      },
      loadURL: vi.fn(),
    };
  }),
}));

vi.mock("electron-log", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    silly: vi.fn(),
    transports: {
      file: {
        resolvePathFn: vi.fn(),
        maxSize: 1024 * 1024 * 10,
        format: "{y}-{m}-{d} {h}:{i}:{s} {level} {message}",
        level: "info",
      },
      console: {
        level: "info",
      },
    },
  },
}));

vi.mock("electron-store", () => ({
  default: class MockStore {
    get = vi.fn((key: string) => {
      if (key === "configs") {
        return appConfigs;
      }
      return null;
    });
    set = vi.fn();
    delete = vi.fn();
    clear = vi.fn();
  },
}));
