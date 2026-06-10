"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ActivityType, Task, TaskPriority } from "@/types/task";
import {
  ACTIVITIES_UPDATED_EVENT,
  clearActivities,
  clearTasks,
  getActivities,
  getTasks,
  saveActivities,
  saveTasks,
  TASKS_UPDATED_EVENT,
} from "@/utils/localStorage";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const syncTasks = () => setTasks(getTasks());
    const syncActivities = () => setActivities(getActivities());

    syncTasks();
    syncActivities();
    window.addEventListener("storage", syncTasks);
    window.addEventListener("storage", syncActivities);
    window.addEventListener(TASKS_UPDATED_EVENT, syncTasks);
    window.addEventListener(ACTIVITIES_UPDATED_EVENT, syncActivities);

    return () => {
      window.removeEventListener("storage", syncTasks);
      window.removeEventListener("storage", syncActivities);
      window.removeEventListener(TASKS_UPDATED_EVENT, syncTasks);
      window.removeEventListener(ACTIVITIES_UPDATED_EVENT, syncActivities);
    };
  }, []);

  const persistTasks = (nextTasks: Task[]) => {
    saveTasks(nextTasks);
    setTasks(nextTasks);
  };

  const addActivity = (type: ActivityType, message: string) => {
    const nextActivities = [
      {
        id: Date.now(),
        type,
        message,
        createdAt: new Date().toISOString(),
      },
      ...getActivities(),
    ];

    saveActivities(nextActivities);
    setActivities(nextActivities);
  };

  const addTask = (
    title: string,
    priority: TaskPriority,
    options?: {
      description?: string;
      dueDate?: string;
      subtasks?: { title: string }[];
    }
  ) => {
    const now = Date.now();
    const nextTask: Task = {
      id: now,
      title,
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
      description: options?.description || undefined,
      dueDate: options?.dueDate || undefined,
      subtasks: (options?.subtasks ?? [])
        .filter((s) => s.title.trim())
        .map((s, i) => ({ id: now + i + 1, title: s.title.trim(), completed: false })),
    };

    persistTasks([nextTask, ...getTasks()]);
    addActivity("task_created", `Created task "${title}".`);
  };

  const deleteTask = (id: number) => {
    const task = tasks.find((item) => item.id === id);

    persistTasks(tasks.filter((item) => item.id !== id));

    if (task) {
      addActivity("task_deleted", `Deleted task "${task.title}".`);
    }
  };

  const toggleTask = (id: number) => {
    const task = tasks.find((item) => item.id === id);
    const nextCompleted = task ? !task.completed : false;

    persistTasks(
      tasks.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: nextCompleted,
              // Cascade: mark all subtasks to match parent state
              subtasks: item.subtasks.map((s) => ({
                ...s,
                completed: nextCompleted,
              })),
            }
          : item
      )
    );

    if (task && !task.completed) {
      addActivity("task_completed", `Completed task "${task.title}".`);
    }
  };

  const addSubtask = (taskId: number, title: string) => {
    const task = tasks.find((item) => item.id === taskId);

    persistTasks(
      tasks.map((item) =>
        item.id === taskId
          ? {
              ...item,
              subtasks: [
                ...item.subtasks,
                { id: Date.now(), title, completed: false },
              ],
            }
          : item
      )
    );

    if (task) {
      addActivity("subtask_added", `Added subtask to "${task.title}".`);
    }
  };

  const toggleSubtask = (taskId: number, subtaskId: number) => {
    const task = tasks.find((item) => item.id === taskId);
    const subtask = task?.subtasks.find((item) => item.id === subtaskId);

    persistTasks(
      tasks.map((item) => {
        if (item.id !== taskId) return item;

        const updatedSubtasks = item.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );

        // Sync parent: complete if all subtasks done, pending if any undone
        const allDone =
          updatedSubtasks.length > 0 &&
          updatedSubtasks.every((s) => s.completed);

        return {
          ...item,
          subtasks: updatedSubtasks,
          completed: allDone,
        };
      })
    );

    if (task && subtask && !subtask.completed) {
      addActivity("subtask_completed", `Completed subtask in "${task.title}".`);
    }
  };

  const editTask = (
    id: number,
    updates: { title?: string; description?: string; priority?: TaskPriority; dueDate?: string }
  ) => {
    persistTasks(
      tasks.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const deleteSubtask = (taskId: number, subtaskId: number) => {
    persistTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
            }
          : task
      )
    );
  };

  const removeAllTasks = () => {
    clearTasks();
    setTasks([]);
  };

  const removeAllActivities = () => {
    clearActivities();
    setActivities([]);
  };

  const stats = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((task) => !task.completed).length,
      completed: tasks.filter((task) => task.completed).length,
      subtasks: tasks.reduce((total, task) => total + task.subtasks.length, 0),
    }),
    [tasks]
  );

  return {
    tasks,
    activities,
    stats,
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
