"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";

// ---------- Fetch Tasks ----------

export async function getTasks() {
  const user = await requireAuth();

  const tasks = await db.task.findMany({
    where: { userId: user.id },
    include: { subtasks: true },
    orderBy: { createdAt: "desc" },
  });

  return tasks;
}

export async function getTaskById(taskId: string) {
  const user = await requireAuth();

  const task = await db.task.findFirst({
    where: { id: taskId, userId: user.id },
    include: { subtasks: true },
  });

  return task;
}

// ---------- Create Task ----------

export async function createTask(data: {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
}) {
  const user = await requireAuth();

  const task = await db.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      priority: data.priority || "medium",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      userId: user.id,
    },
    include: { subtasks: true },
  });

  // Log activity
  await db.activity.create({
    data: {
      type: "task_created",
      message: `Created task "${data.title}"`,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/tasks");

  return task;
}

// ---------- Update Task ----------

export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: string | null;
    completed?: boolean;
  }
) {
  const user = await requireAuth();

  // Verify ownership
  const existing = await db.task.findFirst({
    where: { id: taskId, userId: user.id },
  });

  if (!existing) {
    throw new Error("Task not found");
  }

  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }
  if (data.completed !== undefined) {
    updateData.completed = data.completed;
    updateData.completedAt = data.completed ? new Date() : null;
  }

  const task = await db.task.update({
    where: { id: taskId },
    data: updateData,
    include: { subtasks: true },
  });

  // Log completion activity
  if (data.completed !== undefined && data.completed !== existing.completed) {
    await db.activity.create({
      data: {
        type: data.completed ? "task_completed" : "task_created",
        message: data.completed
          ? `Completed task "${task.title}"`
          : `Reopened task "${task.title}"`,
        userId: user.id,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/tasks");

  return task;
}

// ---------- Delete Task ----------

export async function deleteTask(taskId: string) {
  const user = await requireAuth();

  const existing = await db.task.findFirst({
    where: { id: taskId, userId: user.id },
  });

  if (!existing) {
    throw new Error("Task not found");
  }

  await db.task.delete({
    where: { id: taskId },
  });

  await db.activity.create({
    data: {
      type: "task_deleted",
      message: `Deleted task "${existing.title}"`,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/tasks");

  return { success: true };
}

// ---------- Subtask Operations ----------

export async function createSubtask(taskId: string, title: string) {
  const user = await requireAuth();

  // Verify task ownership
  const task = await db.task.findFirst({
    where: { id: taskId, userId: user.id },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const subtask = await db.subtask.create({
    data: {
      title,
      taskId,
    },
  });

  await db.activity.create({
    data: {
      type: "subtask_added",
      message: `Added subtask "${title}" to "${task.title}"`,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/tasks");

  return subtask;
}

export async function toggleSubtask(subtaskId: string) {
  const user = await requireAuth();

  // Find subtask and verify ownership through task
  const subtask = await db.subtask.findFirst({
    where: { id: subtaskId },
    include: { task: true },
  });

  if (!subtask || subtask.task.userId !== user.id) {
    throw new Error("Subtask not found");
  }

  const updated = await db.subtask.update({
    where: { id: subtaskId },
    data: { completed: !subtask.completed },
  });

  if (updated.completed) {
    await db.activity.create({
      data: {
        type: "subtask_completed",
        message: `Completed subtask "${subtask.title}"`,
        userId: user.id,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/tasks");

  return updated;
}

export async function deleteSubtask(subtaskId: string) {
  const user = await requireAuth();

  const subtask = await db.subtask.findFirst({
    where: { id: subtaskId },
    include: { task: true },
  });

  if (!subtask || subtask.task.userId !== user.id) {
    throw new Error("Subtask not found");
  }

  await db.subtask.delete({
    where: { id: subtaskId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/tasks");

  return { success: true };
}
