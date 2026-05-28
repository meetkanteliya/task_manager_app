'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

import { useTasks } from '@/hooks/useTasks';
import type { Task, TaskStatus } from '@/types/task';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskCreateDialog } from '@/components/tasks/task-create-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const columns: { key: TaskStatus; title: string; hint: string }[] = [
  { key: 'todo', title: 'Todo', hint: 'Queued and ready' },
  { key: 'in-progress', title: 'In progress', hint: 'Currently active' },
  { key: 'done', title: 'Done', hint: 'Shipped and closed' },
];

function ColumnSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-10" />
      </div>
      <div className="mt-3 space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

export default function BoardsPage() {
  const { tasks, isLoading, addTask, updateTask, deleteTask, toggleSubtask } = useTasks();

  const grouped = useMemo(() => {
    const base: Record<TaskStatus, Task[]> = { todo: [], 'in-progress': [], done: [] };
    for (const t of tasks) base[t.status].push(t);
    return base;
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground">Boards</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Workspace board</h1>
          <p className="mt-1 text-sm text-muted-foreground">A realistic kanban view without enterprise noise.</p>
        </div>
        <TaskCreateDialog onCreate={addTask} triggerLabel="New task" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ColumnSkeleton />
          <ColumnSkeleton />
          <ColumnSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {columns.map((col) => (
            <motion.section
              key={col.key}
              layout
              className="rounded-xl border bg-card p-3"
              aria-label={col.title}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold tracking-tight">{col.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{col.hint}</div>
                </div>
                <Badge variant="subtle">{grouped[col.key].length}</Badge>
              </div>

              <div className="mt-3 space-y-3">
                {grouped[col.key].length === 0 ? (
                  <div className="rounded-lg border border-dashed bg-background/40 p-4 text-sm text-muted-foreground">
                    Drag-free by design: move tasks using status.
                  </div>
                ) : (
                  grouped[col.key].map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onToggleSubtask={toggleSubtask}
                      onUpdateTask={updateTask}
                      onDeleteTask={deleteTask}
                      dense
                    />
                  ))
                )}
              </div>
            </motion.section>
          ))}
        </div>
      )}
    </div>
  );
}


