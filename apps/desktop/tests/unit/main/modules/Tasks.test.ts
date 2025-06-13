import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Tasks } from "@/main/modules/Tasks.js";

describe("Tasks", () => {
  let tasksInstance: Tasks;

  beforeEach(() => {
    vi.useFakeTimers();
    tasksInstance = Tasks.getInstance();
  });

  afterEach(() => {
    tasksInstance.destroy();
    vi.useRealTimers();
  });

  it("should be an instance of BaseModule", () => {
    expect(tasksInstance).toBeInstanceOf(Tasks);
  });

  // Additional tests for Tasks can be added here
});
