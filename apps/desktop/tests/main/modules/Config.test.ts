import { describe, it, expect, beforeEach } from "vitest";
import { Config } from "@/main/modules/Config.js";

describe("Config", () => {
  it("should have a singleton instance", () => {
    const instance1 = Config.getInstance();
    const instance2 = Config.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should load configs from user data", () => {
    const config = Config.getInstance();
    expect(config.get("test")).toBe("testValue");
  });

  it("should set and get config values", () => {
    const config = Config.getInstance();
    config.set("newKey", "newValue");
    expect(config.get("newKey")).toBe("newValue");
  });
});
