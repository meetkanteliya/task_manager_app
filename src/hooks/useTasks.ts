"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Task, Activity, TaskPriority } from "@/types/task";
import {
  getTasks as fetchTasks,
  getAllTasks as fetchAllTasks,
  createTaskWithSubtasks as serverCreateTaskWithSubtasks,
  updateTask as serverUpdateTask,
  deleteTask as serverDeleteTask,
  deleteAllTasks as serverDeleteAllTasks,
  createSubtask as serverCreateSubtask,
  toggleSubtask as serverToggleSubtask,
  deleteSubtask as serverDeleteSubtask,
} from "@/lib/actions/tasks";
import {
  getActivities as fetchActivities,
  clearActivities as serverClearActivities,
} from "@/lib/actions/activities";
import { getUserTaskStats } from "@/lib/actions/stats";

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
    userId: dbTask.userId,
    user: { id: dbTask.user.id, name: dbTask.user.name },
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

// Stats type from the server action
interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  weeklyCompleted: number;
  monthlyCompleted: number;
  highPriorityPending: number;
  overdueTasks: number;
  completionRate: number;
}

const defaultStats: TaskStats = {
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  weeklyCompleted: 0,
  monthlyCompleted: 0,
  highPriorityPending: 0,
  overdueTasks: 0,
  completionRate: 0,
};

export function useTasks({ fetchAll = false }: { fetchAll?: boolean } = {}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<TaskStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadData = useCallback(async () => {
    try {
      const taskFetcher = fetchAll ? fetchAllTasks : fetchTasks;
      const [dbTasks, dbActivities, dbStats] = await Promise.all([
        taskFetcher(),
        fetchActivities(),
        getUserTaskStats(),
      ]);
      setTasks(dbTasks.map(mapDbTask));
      setActivities(dbActivities.map(mapDbActivity));
      setStats(dbStats);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
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
        await serverCreateTaskWithSubtasks({
          title,
          priority,
          description: options?.description,
          dueDate: options?.dueDate,
          subtasks: options?.subtasks?.filter((s) => s.title.trim()) ?? [],
        });

        await loadData();
        router.refresh();
        toast.success("Task created");
      } catch (error) {
        console.error("Failed to add task:", error);
        toast.error("Failed to create task");
      }
    });
  };

  const deleteTask = (id: string) => {
    startTransition(async () => {
      try {
        await serverDeleteTask(id);
        await loadData();
        router.refresh();
        toast.success("Task deleted");
      } catch (error) {
        console.error("Failed to delete task:", error);
        toast.error("Failed to delete task");
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
        router.refresh();
      } catch (error) {
        console.error("Failed to toggle task:", error);
        toast.error("Failed to update task");
      }
    });
  };

  const addSubtask = (taskId: string, title: string) => {
    startTransition(async () => {
      try {
        await serverCreateSubtask(taskId, title);
        await loadData();
        router.refresh();
      } catch (error) {
        console.error("Failed to add subtask:", error);
        toast.error("Failed to add subtask");
      }
    });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    startTransition(async () => {
      try {
        await serverToggleSubtask(subtaskId);
        await loadData();
        router.refresh();
      } catch (error) {
        console.error("Failed to toggle subtask:", error);
        toast.error("Failed to update subtask");
      }
    });
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    startTransition(async () => {
      try {
        await serverDeleteSubtask(subtaskId);
        await loadData();
        router.refresh();
      } catch (error) {
        console.error("Failed to delete subtask:", error);
        toast.error("Failed to delete subtask");
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
        router.refresh();
        toast.success("Task updated");
      } catch (error) {
        console.error("Failed to edit task:", error);
        toast.error("Failed to update task");
      }
    });
  };

  const removeAllTasks = () => {
    startTransition(async () => {
      try {
        await serverDeleteAllTasks();
        await loadData();
        router.refresh();
        toast.success("All tasks deleted");
      } catch (error) {
        console.error("Failed to remove all tasks:", error);
        toast.error("Failed to delete tasks");
      }
    });
  };

  const removeAllActivities = () => {
    startTransition(async () => {
      try {
        await serverClearActivities();
        await loadData();
        router.refresh();
        toast.success("Activity log cleared");
      } catch (error) {
        console.error("Failed to clear activities:", error);
        toast.error("Failed to clear activities");
      }
    });
  };

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
