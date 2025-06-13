import { describe, it, expect, beforeEach } from "vitest";
import { getMockElectronStore } from "./mockElectronStore.ts";
import { ScheduleStore } from "@/data/stores/ScheduleStore.ts";

describe("ScheduleStore", () => {
  let store: ScheduleStore;
  const { storeGet, storeSet, storeData } = getMockElectronStore();

  beforeEach(() => {
    store = ScheduleStore.getInstance();
    storeData.clear();
  });

  it("should be a singleton", () => {
    const instance1 = ScheduleStore.getInstance();
    const instance2 = ScheduleStore.getInstance();
    expect(instance1).toBe(instance2);
  });
});
