import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Config } from "@/main/modules/Config.js";
import { Bus } from "@/main/core/Bus.js";

describe("Config", () => {
  let bus: Bus;
  let config: Config;

  beforeEach(() => {
    bus = Bus.getInstance("testBus");
    config = Config.getInstance();
  });
  afterEach(() => {
    bus.destroy();
  });

  it("should have a singleton instance", () => {
    const instance1 = Config.getInstance();
    const instance2 = Config.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should load configs from user data", () => {
    config.set("test", "testValue");
    console.log(config.get("test"));
    expect(config.get("test")).toBe("testValue");
  });

  it("should set and get config values", () => {
    config.set("newKey", "newValue");
    expect(config.get("newKey")).toBe("newValue");
  });

  it("should be able to handle requests via the bus", () => {
    config.set("busKey", "busValue");
    const busValue = bus.get("config:get", "busKey");
    expect(busValue).toEqual(["busValue"]);
  });
});
