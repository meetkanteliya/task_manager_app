'use client';

import * as React from 'react';
import { useTasks } from '@/hooks/useTasks';

type TasksHookValue = ReturnType<typeof useTasks>;

interface TasksContextValue extends TasksHookValue {
  /** Debounced search query — read this to filter tasks */
  searchQuery: string;
  /** Update the raw (un-debounced) search input */
  setSearchQuery: (q: string) => void;
}

const TasksContext = React.createContext<TasksContextValue | null>(null);

/**
 * Provides shared task state and search query to the entire app shell.
 * Replaces the pattern of calling useTasks() independently per page,
 * which caused separate state trees and real-time desync between pages.
 */
export function TasksProvider({ children }: { children: React.ReactNode }) {
  const taskState = useTasks();
  const [searchQuery, setSearchQuery] = React.useState('');

  const value: TasksContextValue = React.useMemo(
    () => ({ ...taskState, searchQuery, setSearchQuery }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [taskState, searchQuery]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

/**
 * Consume shared task state and search query.
 * Must be used inside <TasksProvider>.
 */
export function useTasksContext(): TasksContextValue {
  const ctx = React.useContext(TasksContext);
  if (!ctx) {
    throw new Error('useTasksContext must be used within <TasksProvider>');
  }
  return ctx;
}
