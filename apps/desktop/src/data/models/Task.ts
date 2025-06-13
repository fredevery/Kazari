import { z } from "zod/v4";
import { TaskStates } from "@/shared/enums.ts";

export type Task = z.infer<typeof TaskSchema>;

export const TaskSchema = z.object({
  id: z.string(), // z.uuid({ version: "v4" }),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  // createdAt: z.date(),
  // updatedAt: z.date(),
  dueDate: z.date().optional(),
  state: z.enum(TaskStates).default(TaskStates.PENDING),
  priority: z.string().default("medium"),
  // tags: z.array(z.string()).default([]),
  // subtasks: z.array(z.string()).default([]), // Array of subtask IDs
});
