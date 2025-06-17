import { describe, it, expect, beforeEach } from "vitest";
import { BaseManager } from "@/main/base/BaseManager.ts";

describe("BaseManager", () => {
  let manager: BaseManager;

  beforeEach(() => {
    manager = BaseManager.getInstance();
  });

  it("should create a singleton instance", () => {
    const anotherManager = new BaseManager();
    expect(manager).toBe(anotherManager);
  });

  it("should have a bus instance", () => {
    expect(manager.getBus()).toBeDefined();
    expect(manager.getBus().key).toBe("BaseManager:Bus");
  });
});
