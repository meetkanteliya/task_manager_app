'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import Link from 'next/link';

import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
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
  const { tasks, isLoading, toggleSubtask, addTask, updateTask, deleteTask } = useTasks();
  const [tab, setTab] = useState<'all' | 'pending' | 'completed' | 'important'>('all');

  const filtered = useMemo(() => {
    switch (tab) {
      case 'pending':
        return tasks.filter((t) => !t.completed);
      case 'completed':
        return tasks.filter((t) => t.completed);
      case 'important':
        return tasks.filter(isImportant);
      default:
        return tasks;
    }
  }, [tasks, tab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground">Overview</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">My work</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tasks.length ? `You have ${tasks.length} tasks in your workspace.` : 'Keep it lean. Keep it moving.'}
          </p>
        </div>
        <div className="flex gap-2">
          <TaskCreateDialog onCreate={addTask} />
          <Button asChild variant="outline">
            <Link href="/dashboard/boards">Boards</Link>
          </Button>
        </div>
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

