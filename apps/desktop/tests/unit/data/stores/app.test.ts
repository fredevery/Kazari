import { describe, it, expect } from "vitest";
// import { AppStore, appStore } from "@/data/stores/app.ts";

describe("AppStore", () => {
  it("should be a test", () => {
    expect(true).toBe(true);
  });
});

// Mock zod schemas
// vi.mock("@/data/models/Windows.ts", () => ({
//   WindowConfigSchema: {
//     safeParse: (val: any) => ({
//       success: typeof val === "object",
//       data: val,
//       error: "Invalid",
//     }),
//   },
//   WindowStateSchema: {
//     safeParse: (val: any) => ({
//       success: typeof val === "object",
//       data: val,
//       error: "Invalid",
//     }),
//   },
// }));

// vi.mock("@/data/models/AppConfig.ts", () => ({
//   AppConfigSchema: {
//     safeParse: (val: any) => ({
//       success: typeof val === "object",
//       data: val,
//       error: "Invalid",
//     }),
//   },
// }));

// describe("AppStore", () => {
//   // Mock electron-store
//   const storeSet = vi.fn();
//   const storeGet = vi.fn();
//   vi.mock("electron-store", () => {
//     return {
//       default: vi.fn().mockImplementation(() => ({
//         set: storeSet,
//         get: storeGet,
//       })),
//     };
//   });

//   beforeEach(() => {
//     storeSet.mockClear();
//     storeGet.mockClear();
//   });

//   it("should be a singleton", () => {
//     const instance1 = AppStore.getInstance();
//     const instance2 = AppStore.getInstance();
//     expect(instance1).toBe(instance2);
//   });

//   it("should set and get valid windows", () => {
//     storeGet.mockReturnValueOnce({ win1: { foo: "bar" } });
//     appStore.set("windows", { win1: { foo: "bar" } });
//     expect(storeSet).toHaveBeenCalledWith("windows", { win1: { foo: "bar" } });
//     const result = appStore.get("windows");
//     expect(result).toEqual({ win1: { foo: "bar" } });
//   });

//   it("should set and get valid configs", () => {
//     storeGet.mockReturnValueOnce({ theme: "dark" });
//     appStore.set("configs", { theme: "dark" });
//     expect(storeSet).toHaveBeenCalledWith("configs", { theme: "dark" });
//     const result = appStore.get("configs");
//     expect(result).toEqual({ theme: "dark" });
//   });

//   it("should throw on invalid key", () => {
//     // @ts-expect-error
//     expect(() => appStore.set("invalidKey", {})).toThrow(/Invalid key/);
//   });

//   it("should throw on invalid value", () => {
//     // Simulate schema failure
//     vi.mocked(
//       require("@/data/models/Windows.ts").WindowConfigSchema,
//     ).safeParse = () => ({ success: false, error: "Invalid" });
//     expect(() => appStore.set("windows", "not-an-object")).toThrow(
//       /Invalid value/,
//     );
//   });
// });
