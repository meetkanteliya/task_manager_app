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
            }
          : task
      )
    );

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
  };
}
