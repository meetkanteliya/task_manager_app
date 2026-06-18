import { z } from "zod";

// ---------- Task Validation ----------

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less")
    .optional(),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().nullable().optional(),
  completed: z.boolean().optional(),
});

// ---------- Subtask Validation ----------

export const subtaskTitleSchema = z
  .string()
  .min(1, "Subtask title is required")
  .max(255, "Subtask title must be 255 characters or less");

// ---------- Batch creation ----------

export const createTaskWithSubtasksSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional(),
  subtasks: z
    .array(
      z.object({
        title: z
          .string()
          .min(1)
          .max(255, "Subtask title must be 255 characters or less"),
      })
    )
    .max(50, "Maximum 50 subtasks allowed")
    .default([]),
});

// ---------- Type Exports ----------

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateTaskWithSubtasksInput = z.infer<typeof createTaskWithSubtasksSchema>;
