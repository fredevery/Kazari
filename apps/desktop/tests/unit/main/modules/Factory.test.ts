import { describe, it, expect } from "vitest";
import { ModuleFactory } from "@/main/base/ModuleFactory.ts";
import { BaseModule } from "@/main/modules/BaseModule.ts";

describe("Factory", () => {
  function createMockModuleClass() {
    class MockModule extends BaseModule {
      constructor() {
        super();
      }
    }
    return MockModule;
  }

  it("should create a new instance of a module", () => {
    const TestModule = createMockModuleClass();
    const moduleInstance = ModuleFactory.create(TestModule);
    expect(moduleInstance).toBeInstanceOf(TestModule);
    expect(moduleInstance).toBeInstanceOf(BaseModule);
  });

  it("should set the bus for the module", () => {
    const TestModule = createMockModuleClass();
    expect(() => TestModule.getBus()).toThrowError();
    ModuleFactory.create(TestModule);
    expect(TestModule.getBus()).toBeDefined();
    expect(TestModule.getBus().key).toBe("MockModule:Bus");
  });
});
