<<<<<<< HEAD
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
=======
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, Subtask } from '@/types/task';
import { getTasks, saveTasks } from '@/utils/localStorage';

/**
 * Custom hook for managing tasks with localStorage persistence
 * Provides CRUD operations and automatic saving on state changes
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const loadedTasks = getTasks();
      setTasks(loadedTasks);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load tasks');
      setIsLoading(false);
      console.error('Error loading tasks:', err);
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      const success = saveTasks(tasks);
      if (!success) {
        setError('Failed to save tasks. Storage quota may be exceeded.');
      } else {
        setError(null);
      }
    }
  }, [tasks, isLoading]);

  /**
   * Add a new task
   */
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    setTasks(prevTasks => [...prevTasks, newTask]);
    return newTask;
  }, []);

  /**
   * Update an existing task
   */
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    );
  }, []);

  /**
   * Delete a task
   */
  const deleteTask = useCallback((id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }, []);

  /**
   * Toggle subtask completion status
   */
  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map(subtask =>
            subtask.id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          );
          const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.completed);
          return {
            ...task,
            subtasks: updatedSubtasks,
            completed: allDone ? true : task.completed,
            status: allDone ? 'done' : task.status,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      })
    );
  }, []);

  /**
   * Add a new subtask to a task
   */
  const addSubtask = useCallback((taskId: string, title: string) => {
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      title,
      completed: false,
    };

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [...task.subtasks, newSubtask],
              updatedAt: new Date().toISOString(),
>>>>>>> 8dfdc84a6a4211af9a4e90fffc39dc288c6587fb
            }
          : task
      )
    );
<<<<<<< HEAD
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
=======

    return newSubtask;
  }, []);

  /**
   * Delete a subtask from a task
   */
  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId),
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
  }, []);

  /**
   * Get a single task by ID
   */
  const getTaskById = useCallback((id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  /**
   * Clear all tasks
   */
  const clearAllTasks = useCallback(() => {
    setTasks([]);
  }, []);

  return {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    getTaskById,
    clearAllTasks,
>>>>>>> 8dfdc84a6a4211af9a4e90fffc39dc288c6587fb
  };
}
