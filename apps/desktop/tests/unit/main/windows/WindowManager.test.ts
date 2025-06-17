import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WindowManager } from "@/main/windows/WindowManager.ts";
import { BrowserWindow } from "electron";
import { WindowType } from "@/shared/enums.ts";

describe("WindowManager", () => {
  let windowManager: WindowManager;

  beforeEach(() => {
    windowManager = WindowManager.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a singleton instance", () => {
    const anotherWindowManager = new WindowManager();
    expect(windowManager).toBe(anotherWindowManager);
  });

  it("should have a bus instance", () => {
    expect(windowManager.getBus()).toBeDefined();
    expect(windowManager.getBus().getKey()).toBe("WindowManager:Bus");
  });

  it("should have a static getInstance method", () => {
    expect(WindowManager.getInstance()).toBeInstanceOf(WindowManager);
  });

  it("should respond to the 'app:ready' event", () => {
    vi.spyOn(windowManager, "getCurrentPhase");
    vi.spyOn(windowManager, "launchWindowForPhase");
    windowManager.getBus().emit("app:ready");
    expect(windowManager.getCurrentPhase).toHaveBeenCalled();
    expect(windowManager.getCurrentPhase).toHaveBeenCalledTimes(1);
    expect(windowManager.launchWindowForPhase).toHaveBeenCalled();
    expect(BrowserWindow).toHaveBeenCalled();
    console.log(">>", windowManager.getCurrentWindow());
    expect(windowManager.getCurrentWindow()!.type).toBe(WindowType.PLANNING);
  });
});
