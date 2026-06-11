"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";

export async function getUserTaskStats() {
  const user = await requireAuth();

  const now = new Date();

  // Start of current week (Monday)
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
  startOfWeek.setDate(now.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // Start of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Run all queries in parallel
  const [
    totalTasks,
    completedTasks,
    pendingTasks,
    weeklyCompleted,
    monthlyCompleted,
    highPriorityPending,
    overdueTasks,
  ] = await Promise.all([
    // Total tasks
    db.task.count({
      where: { userId: user.id },
    }),

    // Completed tasks
    db.task.count({
      where: { userId: user.id, completed: true },
    }),

    // Pending tasks
    db.task.count({
      where: { userId: user.id, completed: false },
    }),

    // Completed this week
    db.task.count({
      where: {
        userId: user.id,
        completed: true,
        completedAt: { gte: startOfWeek },
      },
    }),

    // Completed this month
    db.task.count({
      where: {
        userId: user.id,
        completed: true,
        completedAt: { gte: startOfMonth },
      },
    }),

    // High priority pending
    db.task.count({
      where: {
        userId: user.id,
        completed: false,
        priority: "high",
      },
    }),

    // Overdue tasks
    db.task.count({
      where: {
        userId: user.id,
        completed: false,
        dueDate: { lt: now },
      },
    }),
  ]);

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    weeklyCompleted,
    monthlyCompleted,
    highPriorityPending,
    overdueTasks,
    completionRate,
  };
}
