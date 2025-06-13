import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as dateUtils from "@/shared/dateUtils.js";

describe("DateUtils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the correct time difference in milliseconds", () => {
    const start = "10:00";
    const end = "11:30";
    const diff = dateUtils.timeDifferenceInMs(start, end);
    expect(diff).toBe(90 * 60_000); // 90 minutes in milliseconds
  });

  it("should convert time string to Date object", () => {
    const time = "14:30";
    const today = new Date();
    const date = dateUtils.timeToDate(time);
    expect(date.getHours()).toBe(14);
    expect(date.getMinutes()).toBe(30);
    expect(date.getSeconds()).toBe(0);
    expect(date.getMilliseconds()).toBe(0);
    expect(date.getDate()).toBe(today.getDate());
    expect(date.getMonth()).toBe(today.getMonth());
    expect(date.getFullYear()).toBe(today.getFullYear());
  });
});
