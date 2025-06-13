import { vi } from "vitest";

const storeData = new Map<string, any>();
const storeGet = vi.fn((key: string) => storeData.get(key));
const storeSet = vi.fn((key: string, value: any) => {
  storeData.set(key, value);
});

export const getMockElectronStore = () => {
  vi.mock("electron-store", () => {
    return {
      default: vi.fn().mockImplementation(() => ({
        get: storeGet,
        set: storeSet,
      })),
    };
  });

  return {
    storeGet,
    storeSet,
    storeData,
  };
};
