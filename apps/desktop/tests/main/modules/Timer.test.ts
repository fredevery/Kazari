import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Bus } from "@/main/modules/Bus.js";
import { Timer } from "@/main/modules/Timer.js";
import { Phases, TimerEvents } from "@/shared/enums.js";

describe("Timer", () => {
  beforeEach(() => {
    const bus = Bus.getInstance();
    Timer.setBus(bus);
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

  it("should not allow timer overrun if a phase does not allow it", () => {
    const timer = Timer.getInstance();
    timer.setTickDuration(5);
    timer.setCurrentPhase(1); // FOCUS phase
    timer.start();
    expect(timer.currentPhase.type).toBe(Phases.FOCUS);
    expect(timer.currentPhase.remainingTime).toEqual(
      timer.currentPhase.allocatedTime,
    );
    vi.advanceTimersByTime(20);
    expect(timer.currentPhase.remainingTime).toBeLessThanOrEqual(0);
    expect(timer.currentPhase.elapsedTime).toBeLessThanOrEqual(
      timer.currentPhase.allocatedTime,
    );
  });

  it("should start the next phase after the current one ends", () => {
    const timer = Timer.getInstance();
    timer.setTickDuration(5);
    timer.setCurrentPhase(1); // FOCUS phase
    timer.start();
    vi.advanceTimersByTime(10);
    expect(timer.currentPhase.type).toBe(Phases.BREAK);
  });

  it("should emit an event on every tick", () => {
    const timer = Timer.getInstance();
    const emitSpy = vi.spyOn(timer, "emit");

    timer.setTickDuration(5);
    timer.start();
    timer.on(TimerEvents.TICK, (data) => {
      expect(data.phase).toBe(timer.currentPhase);
    });
    vi.advanceTimersByTime(15);
    expect(emitSpy).toHaveBeenCalledTimes(3);
  });
});
