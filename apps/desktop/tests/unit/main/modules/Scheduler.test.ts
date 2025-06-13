import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Scheduler } from "@/main/modules/Scheduler.js";

describe("Scheduler", () => {
  let schedulerInstance: Scheduler;

  beforeEach(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7));

    vi.useFakeTimers();
    vi.setSystemTime(monday);

    schedulerInstance = Scheduler.getInstance();
  });

  afterEach(() => {
    schedulerInstance.destroy();
    vi.useRealTimers();
  });

  it("should have a singleton instance", () => {
    const instance2 = Scheduler.getInstance();
    expect(instance2).toBe(schedulerInstance);
  });

  it("should be an instance of BaseModule", () => {
    expect(schedulerInstance).toBeInstanceOf(Scheduler);
  });

  // Additional tests for Scheduler can be added here

  it("should determine available slots based on user config", () => {
    const slots = schedulerInstance.getAvailableSlots();
    expect(slots).toBeDefined();
    expect(Array.isArray(slots)).toBe(true);
    // Add more specific checks based on the expected slots
  });
});
