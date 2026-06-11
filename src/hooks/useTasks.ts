"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Task, Subtask, Activity, TaskPriority } from "@/types/task";
import {
  getTasks as fetchTasks,
  createTask as serverCreateTask,
  updateTask as serverUpdateTask,
  deleteTask as serverDeleteTask,
  createSubtask as serverCreateSubtask,
  toggleSubtask as serverToggleSubtask,
  deleteSubtask as serverDeleteSubtask,
} from "@/lib/actions/tasks";
import {
  getActivities as fetchActivities,
  clearActivities as serverClearActivities,
} from "@/lib/actions/activities";

// Map DB task shape to our frontend Task type
function mapDbTask(dbTask: Awaited<ReturnType<typeof fetchTasks>>[number]): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    completed: dbTask.completed,
    createdAt: dbTask.createdAt.toISOString(),
    priority: dbTask.priority as TaskPriority,
    description: dbTask.description ?? undefined,
    dueDate: dbTask.dueDate ? dbTask.dueDate.toISOString().split("T")[0] : undefined,
    completedAt: dbTask.completedAt ? dbTask.completedAt.toISOString() : undefined,
    subtasks: dbTask.subtasks.map((s) => ({
      id: s.id,
      title: s.title,
      completed: s.completed,
    })),
  };
}

function mapDbActivity(dbActivity: Awaited<ReturnType<typeof fetchActivities>>[number]): Activity {
  return {
    id: dbActivity.id,
    type: dbActivity.type as Activity["type"],
    message: dbActivity.message,
    createdAt: dbActivity.createdAt.toISOString(),
  };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadData = useCallback(async () => {
    try {
      const [dbTasks, dbActivities] = await Promise.all([
        fetchTasks(),
        fetchActivities(),
      ]);
      setTasks(dbTasks.map(mapDbTask));
      setActivities(dbActivities.map(mapDbActivity));
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addTask = (
    title: string,
    priority: TaskPriority,
    options?: {
      description?: string;
      dueDate?: string;
      subtasks?: { title: string }[];
    }
  ) => {
    startTransition(async () => {
      try {
        const newTask = await serverCreateTask({
          title,
          priority,
          description: options?.description,
          dueDate: options?.dueDate,
        });

        // Create subtasks if provided
        if (options?.subtasks) {
          for (const subtask of options.subtasks) {
            if (subtask.title.trim()) {
              await serverCreateSubtask(newTask.id, subtask.title.trim());
            }
          }
        }

        await loadData();
      } catch (error) {
        console.error("Failed to add task:", error);
      }
    });
  };

  const deleteTask = (id: string) => {
    startTransition(async () => {
      try {
        await serverDeleteTask(id);
        await loadData();
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    });
  };

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    startTransition(async () => {
      try {
        await serverUpdateTask(id, { completed: !task.completed });
        await loadData();
      } catch (error) {
        console.error("Failed to toggle task:", error);
      }
    });
  };

  const addSubtask = (taskId: string, title: string) => {
    startTransition(async () => {
      try {
        await serverCreateSubtask(taskId, title);
        await loadData();
      } catch (error) {
        console.error("Failed to add subtask:", error);
      }
    });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    startTransition(async () => {
      try {
        await serverToggleSubtask(subtaskId);
        await loadData();
      } catch (error) {
        console.error("Failed to toggle subtask:", error);
      }
    });
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    startTransition(async () => {
      try {
        await serverDeleteSubtask(subtaskId);
        await loadData();
      } catch (error) {
        console.error("Failed to delete subtask:", error);
      }
    });
  };

  const editTask = (
    id: string,
    updates: { title?: string; description?: string; priority?: TaskPriority; dueDate?: string | null }
  ) => {
    startTransition(async () => {
      try {
        await serverUpdateTask(id, updates);
        await loadData();
      } catch (error) {
        console.error("Failed to edit task:", error);
      }
    });
  };

  const removeAllTasks = () => {
    startTransition(async () => {
      try {
        for (const task of tasks) {
          await serverDeleteTask(task.id);
        }
        await loadData();
      } catch (error) {
        console.error("Failed to remove all tasks:", error);
      }
    });
  };

  const removeAllActivities = () => {
    startTransition(async () => {
      try {
        await serverClearActivities();
        await loadData();
      } catch (error) {
        console.error("Failed to clear activities:", error);
      }
    });
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((task) => !task.completed).length;
    const completed = tasks.filter((task) => task.completed).length;
    const subtasks = tasks.reduce((total, task) => total + task.subtasks.length, 0);

    const now = new Date();
    
    // Start of week (Monday)
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const weeklyCompleted = tasks.filter(
      (t) => t.completed && t.completedAt && new Date(t.completedAt) >= startOfWeek
    ).length;

    const monthlyCompleted = tasks.filter(
      (t) => t.completed && t.completedAt && new Date(t.completedAt) >= startOfMonth
    ).length;

    return {
      total,
      pending,
      completed,
      subtasks,
      weeklyCompleted,
      monthlyCompleted,
    };
  }, [tasks]);

  return {
    tasks,
    activities,
    stats,
    isLoading,
    isPending,
    addTask,
    deleteTask,
    toggleTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    editTask,
    removeAllTasks,
    removeAllActivities,
  };
}
