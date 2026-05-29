'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';

import { useTasksContext } from '@/context/tasks-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Task } from '@/types/task';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskCreateDialog } from '@/components/tasks/task-create-dialog';
import { TaskEmptyState } from '@/components/tasks/task-empty-state';

function isImportant(task: Task) {
  return task.priority === 'high';
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-80 max-w-[70%]" />
            </div>
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-2 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { tasks, isLoading, searchQuery, toggleSubtask, addTask, updateTask, deleteTask } = useTasksContext();
  const [tab, setTab] = useState<'all' | 'pending' | 'completed' | 'important'>('all');

  const filtered = useMemo(() => {
    // 1. Tab filter
    let result: Task[];
    switch (tab) {
      case 'pending':
        result = tasks.filter((t) => !t.completed);
        break;
      case 'completed':
        result = tasks.filter((t) => t.completed);
        break;
      case 'important':
        result = tasks.filter(isImportant);
        break;
      default:
        result = tasks;
    }

    // 2. Search filter (title + description, case-insensitive)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tasks, tab, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground">Overview</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">My work</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSearching
              ? filtered.length === 0
                ? `No tasks match "${searchQuery}"`
                : `${filtered.length} result${filtered.length === 1 ? '' : 's'} for "${searchQuery}"`
              : tasks.length
              ? `${tasks.length} task${tasks.length === 1 ? '' : 's'} in your queue.`
              : 'Keep it lean. Keep it moving.'}
          </p>
        </div>
        <TaskCreateDialog onCreate={addTask} />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="w-full justify-start md:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {isLoading ? (
            <LoadingGrid />
          ) : filtered.length === 0 ? (
            <TaskEmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filtered.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleSubtask={toggleSubtask}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
