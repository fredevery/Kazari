import { describe, it, expect, beforeEach } from "vitest";
import { getMockElectronStore } from "./mockElectronStore.ts";
import { TasksStore } from "@/data/stores/TasksStore.ts";
import { type Task } from "@/data/models/Task.ts";
import { TaskStates } from "@/shared/enums.ts";

const today = new Date();
const mockTask = (task: Partial<Task> = {}) => ({
  id: "1",
  title: "Test Task",
  description: "This is a test task",
  dueDate: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
  state: TaskStates.PENDING,
  priority: "medium",
  ...task,
});

describe("TasksStore", () => {
  let store: TasksStore;
  const { storeGet, storeSet, storeData } = getMockElectronStore();
  beforeEach(() => {
    store = TasksStore.getInstance();
    storeData.clear();
  });

  it("should be a singleton", () => {
    const instance1 = TasksStore.getInstance();
    const instance2 = TasksStore.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should add a task and retrieve it", () => {
    const task = mockTask();
    store.addTasks(task);
    expect(storeSet).toHaveBeenCalledWith("tasks", [task]);
    expect(storeGet).toHaveBeenCalledWith("tasks");
    const tasks = store.getTasks();
    expect(tasks).toEqual([task]);
  });

  it("should parse a valid task", () => {
    const task = mockTask();
    const parsedTask = store.parseTask(task);
    expect(parsedTask).toEqual(task);
  });

  it("should throw an error for an invalid task", () => {
    const invalidTask = mockTask({ title: "" }); // Invalid because title is empty
    expect(() => store.parseTask(invalidTask)).toThrowError();
  });

  it("shoulld retrieve a task by ID", () => {
    const task = mockTask();
    store.addTasks(task);
    const retrievedTask = store.getTaskById(task.id);
    expect(retrievedTask).toEqual(task);
  });

  it("should return undefined for a non-existent task ID", () => {
    const retrievedTask = store.getTaskById("non-existent-id");
    expect(retrievedTask).toBeUndefined();
  });

  it("should retrieve completed tasks", () => {
    const task1 = mockTask();
    const task2 = mockTask({ id: "2", state: TaskStates.COMPLETED });
    store.addTasks(task1);
    store.addTasks(task2);
    const completedTasks = store.getCompletedTasks();
    expect(completedTasks).toEqual([task2]);
  });

  it("should retrieve pending tasks", () => {
    const task1 = mockTask();
    const task2 = mockTask({ id: "2", state: TaskStates.IN_PROGRESS });
    store.addTasks(task1);
    store.addTasks(task2);
    const pendingTasks = store.getPendingTasks();
    expect(pendingTasks).toEqual([task1]);
  });

  it("should set a task as completed", () => {
    const task1 = mockTask();
    const task2 = mockTask();
    store.addTasks(task1, task2);

    store.setTaskAsCompleted(task1);
    const completedTasks = store.getCompletedTasks();
    expect(completedTasks).toEqual([{ ...task1, state: TaskStates.COMPLETED }]);
  });

  it("should set a task as pending", () => {
    const task1 = mockTask({ state: TaskStates.IN_PROGRESS });
    const task2 = mockTask({ id: "2", state: TaskStates.IN_PROGRESS });
    store.addTasks(task1, task2);

    store.setTaskAsPending(task2);
    const pendingTasks = store.getPendingTasks();
    expect(pendingTasks).toEqual([{ ...task2, state: TaskStates.PENDING }]);
  });

  it("should set a task as in progress", () => {
    const task1 = mockTask();
    const task2 = mockTask({ id: "2", state: TaskStates.PENDING });
    store.addTasks(task1, task2);

    store.setTaskAsInProgress(task2);
    const inProgressTasks = store.getInProgressTasks();
    expect(inProgressTasks).toEqual([
      { ...task2, state: TaskStates.IN_PROGRESS },
    ]);
  });
});
