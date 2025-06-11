import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Bus } from "@/main/modules/Bus.js";

describe("Bus", () => {
  let bus: Bus;

  beforeEach(() => {
    bus = Bus.getInstance();
  });

  it("should be a singleton", () => {
    const anotherBus = Bus.getInstance();
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

    bus.off("test:event", callback);

    bus.emit("test:event", { data: "test" });

    expect(callback).not.toHaveBeenCalled();
  });
});
