import { z } from "zod/v4";
import Store from "electron-store";
import { TaskSchema, type Task } from "@/data/models/Task.ts";
import { TaskStates } from "@/shared/enums.ts";
import { BaseStore } from "./BaseStore.ts";

const TasksStoreSchema = z.object({
  tasks: z.array(TaskSchema),
});

export class TasksStore extends BaseStore {
  private schema = TasksStoreSchema;
  private store: Store<z.infer<typeof this.schema>>;

  constructor() {
    super();
    this.store = new Store<z.infer<typeof this.schema>>({});
  }

  getTasks() {
    const tasks = this.store.get("tasks") || [];
    const parsedTasks = tasks.map((task) => this.parseTask(task));
    return parsedTasks;
  }

  getTaskById(id: string) {
    const tasks = this.getTasks();
    const task = tasks.find((task) => task.id === id);
    return task;
  }

  getCompletedTasks() {
    const tasks = this.getTasks();
    return tasks.filter((task) => task.state === TaskStates.COMPLETED);
  }

  getPendingTasks() {
    const tasks = this.getTasks();
    return tasks.filter((task) => task.state === TaskStates.PENDING);
  }

  getInProgressTasks() {
    const tasks = this.getTasks();
    return tasks.filter((task) => task.state === TaskStates.IN_PROGRESS);
  }

  resolveTask(task: Task): Task {
    const existingTask = this.getTaskById(task.id);
    if (!existingTask) {
      this.addTasks(task);
      return this.resolveTask(task);
    }
    return existingTask;
  }

  setTaskAsCompleted(targetTask: Task): void {
    const task = this.resolveTask(targetTask);
    task.state = TaskStates.COMPLETED;
    this.saveTask(task);
  }

  setTaskAsPending(targetTask: Task) {
    const task = this.resolveTask(targetTask);
    task.state = TaskStates.PENDING;
    this.saveTask(task);
  }

  setTaskAsInProgress(targetTask: Task) {
    const task = this.resolveTask(targetTask);
    task.state = TaskStates.IN_PROGRESS;
    this.saveTask(task);
  }

  addTasks(task: Task, ...otherTasks: Task[]) {
    const tasks = this.getTasks();
    [task, ...otherTasks].forEach((task) => {
      tasks.push(this.parseTask(task));
    });
    this.store.set("tasks", tasks);
  }

  parseTask(task: Task) {
    const parsed = this.schema.shape.tasks.element.safeParse(task);
    if (!parsed.success) {
      throw new Error(`Invalid task: ${parsed.error}`);
    }
    return parsed.data;
  }

  saveTask(task: Task) {
    const tasks = this.getTasks();
    const existingIndex = tasks.findIndex((t) => t.id === task.id);
    if (existingIndex !== -1) {
      tasks[existingIndex] = this.parseTask(task);
    } else {
      tasks.push(this.parseTask(task));
    }
    this.store.set("tasks", tasks);
  }
}
