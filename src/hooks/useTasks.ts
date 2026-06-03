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

  const addTask = (title: string, priority: TaskPriority) => {
    const nextTask: Task = {
      id: Date.now(),
      title,
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
      subtasks: [],
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

    persistTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
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
      tasks.map((item) =>
        item.id === taskId
          ? {
              ...item,
              subtasks: item.subtasks.map((subtask) =>
                subtask.id === subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask
              ),
            }
          : item
      )
    );

    if (task && subtask && !subtask.completed) {
      addActivity("subtask_completed", `Completed subtask in "${task.title}".`);
    }
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
    removeAllTasks,
    removeAllActivities,
  };
}
