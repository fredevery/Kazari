import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Bus, RootBus } from "@/main/modules/Bus.js";

describe("Bus", () => {
  let bus: Bus;
  let rootBus: RootBus;

  beforeEach(() => {
    bus = Bus.getInstance("testBus");
  });

  afterEach(() => {
    // Clean up the bus instance after each test
    bus.destroy();
  });

  it("should be a singleton", () => {
    const anotherBus = Bus.getInstance("testBus");
    expect(bus).toBe(anotherBus);
  });

  it("should emit and listen to events", () => {
    const callback = vi.fn();
    bus.on("test:event", callback);
    bus.emit("test:event", { data: "test" });
    expect(callback).toHaveBeenCalledWith({ data: "test" });
  });

  it("should remove event listeners", () => {
    const callback = vi.fn();
    bus.on("test:event", callback);
    expect(bus.hasActiveListeners()).toBe(true);
    bus.off("test:event", callback);
    bus.emit("test:event", { data: "test" });
    expect(bus.hasActiveListeners()).toBe(false);
    expect(callback).not.toHaveBeenCalled();
  });

  it("should register itself with the root bus", () => {
    rootBus = Bus.getRootBus();
    expect(rootBus).toBeDefined();
    expect(rootBus.hasBus("testBus")).toBe(true);
  });

  it("should deregister itself from the root bus", () => {
    rootBus = Bus.getRootBus();
    const eventNames = ["test:event", "another:event", "yet:another:event"];
    eventNames.forEach((event) => {
      bus.on(event, () => {});
    });
    expect(bus.hasActiveListeners()).toBe(true);
    expect(bus.eventNames()).toEqual(eventNames);
    expect(rootBus.hasBus("testBus")).toBe(true);
    bus.destroy();
    expect(bus.hasActiveListeners()).toBe(false);
    expect(bus.eventNames()).toEqual([]);
    expect(rootBus.hasBus("testBus")).toBe(false);
  });

  it("should be able to check if there are active listeners for an event", () => {
    const callback = vi.fn();
    bus.on("test:event", callback);
    expect(bus.hasActiveListeners("test:event")).toBe(true);
    bus.off("test:event", callback);
    expect(bus.hasActiveListeners("test:event")).toBe(false);
  });

  it("should warn if trying to remove a listener that does not exist", () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    bus.off("nonexistent:event", () => {});
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "No listeners found for event: nonexistent:event",
    );
    consoleWarnSpy.mockRestore();
  });

  it("should remove all listeners if no listener is provided", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    bus.on("test:event", callback1);
    bus.on("test:event", callback2);
    expect(bus.hasActiveListeners("test:event")).toBe(true);
    bus.off("test:event");
    expect(bus.hasActiveListeners("test:event")).toBe(false);
    bus.emit("test:event", { data: "test" });
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });

  it("should warn if trying to add a listener that already exists", () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    const callback = () => {};
    bus.on("test:event", callback);
    bus.on("test:event", callback); // Adding the same listener again
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Listener for event "test:event" already exists.',
    );
    consoleWarnSpy.mockRestore();
  });

  it("should throw an errof if trying to instantiate without a key", () => {
    expect(() => {
      // @ts-expect-error Testing without a key
      new Bus({});
    }).toThrow("Key is required to create a Bus instance.");
  });

  it("should emit global events to the root bus", () => {
    const bus2 = Bus.getInstance("testBus2");
    const bus3 = Bus.getInstance("testBus3");
    const globalCallback = vi.fn();
    const ignoreGlobalCallback = vi.fn();
    bus2.on("test:event:global", globalCallback);
    bus3.on("test:event:ignoreGlobal", ignoreGlobalCallback);
    bus.emit("test:event:global", { data: "global test" });
    expect(globalCallback).toHaveBeenCalledWith({ data: "global test" });
    expect(ignoreGlobalCallback).not.toHaveBeenCalled();
  });

  it("should warn if trying to remove instance that does not exist", () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    Bus.removeInstance("nonExistentBus");
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "No instance found with key: nonExistentBus",
    );
    consoleWarnSpy.mockRestore();
  });
});
