import { BaseModule } from "./BaseModule.ts";
import { TasksStore } from "@/data/stores/TasksStore.ts";
import { type Task } from "@/data/models/Task.ts";

export class Tasks extends BaseModule {
  private tasksStore: TasksStore;

  constructor() {
    super();
    this.tasksStore = TasksStore.getInstance();
  }

  getTasks(): Task[] {
    return this.tasksStore.getTasks();
  }

  getTaskById(id: string): Task | undefined {
    return this.tasksStore.getTaskById(id);
  }

  getCompletedTasks(): Task[] {
    return this.tasksStore.getCompletedTasks();
  }

  getPendingTasks(): Task[] {
    return this.tasksStore.getPendingTasks();
  }

  getInProgressTasks(): Task[] {
    return this.tasksStore.getInProgressTasks();
  }

  setTaskAsCompleted(task: Task): void {
    this.tasksStore.setTaskAsCompleted(task);
  }

  saveTask(task: Task): void {
    this.tasksStore.saveTask(task);
  }
}
