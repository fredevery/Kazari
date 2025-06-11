import { vi } from "vitest";
import appConfigs from "./fixtures/appConfigs.json" with { type: "json" };

// vi.mock("electron", () => ({
//   app: {
//     isPackaged: false,
//     getPath: (pathName: string) => {
//       if (pathName === "userData") {
//         return "/mock/user/data/path";
//       }
//       return "";
//     },
//   },
//   ipcMain: {
//     handle: vi.fn(),
//     on: vi.fn(),
//     emit: vi.fn(),
//     removeListener: vi.fn(),
//     removeAllListeners: vi.fn(),
//     once: vi.fn(),
//     listeners: vi.fn(() => []),
//     eventNames: vi.fn(() => []),
//   },
// }));

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
