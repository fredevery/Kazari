import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Bus } from "@/main/core/Bus.ts";

describe("Bus", () => {
  let bus: Bus;
  let rootBus: Bus;

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

  it("should throw an error if trying to remove a listener that does not exist", () => {
    expect(() => bus.off("nonexistent:event", () => {})).toThrow();
  });

  it("should remove all listeners if no listener is provided", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    bus.on("test:event", callback1);
    bus.on("test:event", callback2);
    expect(bus.hasActiveListeners("test:event")).toBe(true);
    bus.offAll("test:event");
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
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  it("should throw an errof if trying to instantiate without a key", () => {
    expect(() => {
      // @ts-expect-error Testing without a key
      new Bus({});
    }).toThrow();
  });

  it("should send events to all buses that can handle them", () => {
    const bus2 = Bus.getInstance("testBus2");
    const bus3 = Bus.getInstance("testBus3");
    const bus4 = Bus.getInstance("testBus4", bus);
    const bus5 = Bus.getInstance("testBus5", bus);
    const bus6 = Bus.getInstance("testBus6", bus4);
    const bus7 = Bus.getInstance("testBus7", bus6);
    const bus8 = Bus.getInstance("testBus8", bus7);

    const callback2 = vi.fn();
    const callback3 = vi.fn();
    const callback4 = vi.fn();
    const callback5 = vi.fn();
    const callback6 = vi.fn();
    const callback7 = vi.fn();
    const callback8 = vi.fn();

    bus2.on("test:event:all", callback2);
    bus3.on("test:event:all", callback3);
    bus4.on("test:event:all", callback4);
    bus5.on("test:event:all", callback5);
    bus6.on("test:event:all", callback6);
    bus7.on("test:event:not:all", callback7);
    bus8.on("test:event:all", callback8);

    bus.emit("test:event:all", { data: "test" });

    expect(callback2).toHaveBeenCalledWith({ data: "test" });
    expect(callback3).toHaveBeenCalledWith({ data: "test" });
    expect(callback4).toHaveBeenCalledWith({ data: "test" });
    expect(callback5).toHaveBeenCalledWith({ data: "test" });
    expect(callback6).toHaveBeenCalledWith({ data: "test" });
    expect(callback7).not.toHaveBeenCalled(); // Should not be called
    expect(callback8).toHaveBeenCalledWith({ data: "test" });

    expect(bus2.hasActiveListeners("test:event:all")).toBe(true);
    expect(bus3.hasActiveListeners("test:event:all")).toBe(true);
    expect(bus4.hasActiveListeners("test:event:all")).toBe(true);
    expect(bus5.hasActiveListeners("test:event:all")).toBe(true);
    expect(bus6.hasActiveListeners("test:event:all")).toBe(true);
    expect(bus7.hasActiveListeners("test:event:not:all")).toBe(true);
    expect(bus8.hasActiveListeners("test:event:all")).toBe(true);

    // Clean up
    bus2.off("test:event:all", callback2);
    bus3.off("test:event:all", callback3);
    bus4.off("test:event:all", callback4);
    bus5.off("test:event:all", callback5);
    bus6.off("test:event:all", callback6);
    bus7.off("test:event:not:all", callback7);
    bus8.off("test:event:all", callback8);

    expect(bus2.hasActiveListeners("test:event:all")).toBe(false);
    expect(bus3.hasActiveListeners("test:event:all")).toBe(false);
    expect(bus4.hasActiveListeners("test:event:all")).toBe(false);
    expect(bus5.hasActiveListeners("test:event:all")).toBe(false);
    expect(bus6.hasActiveListeners("test:event:all")).toBe(false);
    expect(bus7.hasActiveListeners("test:event:not:all")).toBe(false);
    expect(bus8.hasActiveListeners("test:event:all")).toBe(false);
  });

  // it("should emit global events to the root bus", () => {
  //   const bus2 = Bus.getInstance("testBus2");
  //   const bus3 = Bus.getInstance("testBus3");
  //   const globalCallback = vi.fn();
  //   const ignoreGlobalCallback = vi.fn();
  //   bus2.on("test:event:global", globalCallback);
  //   bus3.on("test:event:ignoreGlobal", ignoreGlobalCallback);
  //   bus.emit("test:event:global", { data: "global test" });
  //   expect(globalCallback).toHaveBeenCalledWith({ data: "global test" });
  //   expect(ignoreGlobalCallback).not.toHaveBeenCalled();
  // });

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
