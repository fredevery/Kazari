import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Timer } from "@/main/modules/Timer.js";
import { Phases } from "@/shared/constants.js";

describe("Timer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should have a singleton instance", () => {
    const instance1 = Timer.getInstance();
    const instance2 = Timer.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should load phases from config", () => {
    const timer = Timer.getInstance();
    const phaseTypes = timer.phases.map((phase) => phase.type);
    expect(phaseTypes).toContain(Phases.PLANNING);
    expect(phaseTypes).toContain(Phases.FOCUS);
    expect(phaseTypes).toContain(Phases.BREAK);
  });

  it("should run a phase", () => {
    const timer = Timer.getInstance();
    timer.setTickDuration(5);
    timer.start();
    expect(timer.currentPhase.type).toBe(Phases.PLANNING);
    expect(timer.currentPhase.remainingTime).toEqual(
      timer.currentPhase.allocatedTime,
    );
    vi.advanceTimersByTime(5);
    expect(timer.currentPhase.remainingTime).toBeGreaterThan(0);
    expect(timer.currentPhase.remainingTime).toBeLessThan(
      timer.currentPhase.allocatedTime,
    );
    vi.advanceTimersByTime(5);
    expect(timer.currentPhase.remainingTime).toBe(0);
  });

  it("should allow timer overrun if a phase allows it", () => {
    const timer = Timer.getInstance();
    timer.setTickDuration(5);
    timer.setCurrentPhase(0);
    timer.start();
    expect(timer.currentPhase.type).toBe(Phases.PLANNING);
    expect(timer.currentPhase.remainingTime).toEqual(
      timer.currentPhase.allocatedTime,
    );
    vi.advanceTimersByTime(20);
    expect(timer.currentPhase.remainingTime).toBeLessThan(0);
    expect(timer.currentPhase.elapsedTime).toBeGreaterThan(
      timer.currentPhase.allocatedTime,
    );
  });
});
