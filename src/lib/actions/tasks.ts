"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { can, Role } from "@/lib/permissions";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";
import {
  createTaskSchema,
  createTaskWithSubtasksSchema,
  updateTaskSchema,
  subtaskTitleSchema,
} from "@/lib/validations/task";


// Helper — session + role take both at once
async function getSessionWithRole() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}
// ---------- Fetch Tasks ----------

export async function getTasks() {
  const user = await requireAuth();

  const tasks = await db.task.findMany({
    where: { userId: user.id },
    include: { subtasks: true, user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return tasks;
}

export async function getAllTasks() {
  await requireAuth();

  const tasks = await db.task.findMany({
    include: { subtasks: true, user: { select: { id: true, name: true } } },
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

export async function createTask(rawData: {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
}) {
  const data = createTaskSchema.parse(rawData);
  const user = await requireAuth();

  const task = await db.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      priority: data.priority,
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
  rawData: {
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: string | null;
    completed?: boolean;
  }
) {
  const data = updateTaskSchema.parse(rawData);
  const user = await requireAuth();

  // Verify ownership
  const existing = await db.task.findFirst({
    where: { id: taskId, userId: user.id },
    include: { subtasks: true },
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

    // Sync subtasks completion status
    if (existing.subtasks.length > 0) {
      await db.subtask.updateMany({
        where: { taskId },
        data: { completed: data.completed },
      });
    }
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
        type: data.completed ? "task_completed" : "task_reopened",
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
  const session = await getSessionWithRole();
  const role = session.user.role as Role;
  const userId = session.user.id;

  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

     
  // MEMBER: only own tasks delete
  if (!can(role, "canDeleteAnyTask") && task.userId !== userId) {
    throw new Error("You can only delete your own tasks");
  }
  // VIEWER: cannot delete at all
  if (!can(role, "canDeleteOwnTask")) {
    throw new Error("Your role does not allow deleting tasks");
  }

  await db.task.delete({
    where: { id: taskId },
  });


  await db.activity.create({
    data: {
      type: "task_deleted",
      message: `Deleted task "${task.title}"`,
      userId: userId,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/tasks");

  return { success: true };
}

// ---------- Subtask Operations ----------
export async function purgeAllTasks() {
  const session = await getSessionWithRole();
  const role = session.user.role as Role;

  if (!can(role, "canPurgeData")) {
    throw new Error("Only admins can purge data");
  }

  await db.task.deleteMany({ where: { userId: session.user.id } });

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
}
export async function createSubtask(taskId: string, rawTitle: string) {
  const title = subtaskTitleSchema.parse(rawTitle);
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

  // Since a new subtask is pending, the main task can no longer be completed
  if (task.completed) {
    await db.task.update({
      where: { id: taskId },
      data: { completed: false, completedAt: null },
    });
  }

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

  // Calculate task completion based on all subtasks status
  const allSubtasks = await db.subtask.findMany({
    where: { taskId: subtask.taskId },
  });

  const allCompleted = allSubtasks.every((s) => s.completed);
  const taskWasCompleted = subtask.task.completed;

  if (allCompleted && !taskWasCompleted) {
    await db.task.update({
      where: { id: subtask.taskId },
      data: { completed: true, completedAt: new Date() },
    });
    await db.activity.create({
      data: {
        type: "task_completed",
        message: `Completed task "${subtask.task.title}"`,
        userId: user.id,
      },
    });
  } else if (!allCompleted && taskWasCompleted) {
    await db.task.update({
      where: { id: subtask.taskId },
      data: { completed: false, completedAt: null },
    });
    await db.activity.create({
      data: {
        type: "task_reopened",
        message: `Reopened task "${subtask.task.title}"`,
        userId: user.id,
      },
    });
  }

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

  // Check remaining subtasks of this task
  const remainingSubtasks = await db.subtask.findMany({
    where: { taskId: subtask.taskId },
  });

  if (remainingSubtasks.length > 0) {
    const allCompleted = remainingSubtasks.every((s) => s.completed);
    const taskWasCompleted = subtask.task.completed;

    if (allCompleted && !taskWasCompleted) {
      await db.task.update({
        where: { id: subtask.taskId },
        data: { completed: true, completedAt: new Date() },
      });
      await db.activity.create({
        data: {
          type: "task_completed",
          message: `Completed task "${subtask.task.title}"`,
          userId: user.id,
        },
      });
    } else if (!allCompleted && taskWasCompleted) {
      await db.task.update({
        where: { id: subtask.taskId },
        data: { completed: false, completedAt: null },
      });
      await db.activity.create({
        data: {
          type: "task_reopened",
          message: `Reopened task "${subtask.task.title}"`,
          userId: user.id,
        },
      });
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/tasks");

  return { success: true };
}

// ---------- Batch Operations ----------

export async function createTaskWithSubtasks(rawData: {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  subtasks?: { title: string }[];
}) {
  const data = createTaskWithSubtasksSchema.parse(rawData);
  const user = await requireAuth();

  const result = await db.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId: user.id,
      },
    });

    if (data.subtasks.length > 0) {
      await tx.subtask.createMany({
        data: data.subtasks.map((s) => ({
          title: s.title,
          taskId: task.id,
        })),
      });
    }

    await tx.activity.create({
      data: {
        type: "task_created",
        message: `Created task "${data.title}"`,
        userId: user.id,
      },
    });

    return tx.task.findUniqueOrThrow({
      where: { id: task.id },
      include: { subtasks: true },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/tasks");

  return result;
}

export async function deleteAllTasks() {
  const user = await requireAuth();

  const count = await db.task.count({ where: { userId: user.id } });

  await db.task.deleteMany({
    where: { userId: user.id },
  });

  await db.activity.create({
    data: {
      type: "task_deleted",
      message: `Deleted all tasks (${count} tasks)`,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/tasks");

  return { success: true, deletedCount: count };
}
