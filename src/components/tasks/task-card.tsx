'use client';

import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, ChevronDown, ChevronUp, ListChecks, Pencil, Trash2 } from 'lucide-react';

import type { Task, TaskPriority, TaskStatus } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

function formatDueDate(value: string | null) {
  if (!value) return null;
  try {
    const d = new Date(value);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
}

function isOverdue(task: Task): boolean {
  if (task.completed || !task.dueDate) return false;
  return new Date(task.dueDate) < new Date();
}

function priorityBadge(priority: Task['priority']) {
  switch (priority) {
    case 'high':
      return <Badge variant="danger">High</Badge>;
    case 'medium':
      return <Badge variant="warning">Medium</Badge>;
    default:
      return <Badge variant="subtle">Low</Badge>;
  }
}

function taskProgress(task: Task) {
  if (!task.subtasks.length) return task.completed ? 100 : 0;
  const done = task.subtasks.filter((s) => s.completed).length;
  return Math.round((done / task.subtasks.length) * 100);
}

export function TaskCard({
  task,
  onToggleSubtask,
  onUpdateTask,
  onDeleteTask,
  dense = false,
}: {
  task: Task;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  dense?: boolean;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);

  const titleRef = useRef<HTMLInputElement | null>(null);

  const progress = useMemo(() => taskProgress(task), [task]);
  const due = useMemo(() => formatDueDate(task.dueDate), [task.dueDate]);
  const overdue = useMemo(() => isOverdue(task), [task]);
  const doneCount = task.subtasks.filter((s) => s.completed).length;
  const totalCount = task.subtasks.length;

  const statusDot = task.completed
    ? 'bg-emerald-400/80'
    : task.status === 'in-progress'
      ? 'bg-amber-300/80'
      : 'bg-muted-foreground/60';

  function beginInlineEdit() {
    setEditing(true);
    setTitle(task.title);
    setDescription(task.description);
    queueMicrotask(() => titleRef.current?.focus());
  }

  function cancelInlineEdit() {
    setEditing(false);
    setTitle(task.title);
    setDescription(task.description);
  }

  function commitInlineEdit() {
    const nextTitle = title.trim();
    if (!nextTitle) {
      cancelInlineEdit();
      return;
    }
    const nextDescription = description.trim();
    onUpdateTask(task.id, { title: nextTitle, description: nextDescription });
    setEditing(false);
  }

  function setStatus(next: TaskStatus) {
    onUpdateTask(task.id, { status: next, completed: next === 'done' });
  }

  function setPriority(next: TaskPriority) {
    onUpdateTask(task.id, { priority: next });
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'group rounded-xl border bg-card shadow-sm hover:shadow-md',
        overdue && 'border-red-500/40 bg-red-500/[0.02]',
        dense ? 'p-3' : 'p-4'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className={cn('h-2 w-2 rounded-full', statusDot)} aria-hidden />

            {editing ? (
              <Input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 font-semibold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitInlineEdit();
                  if (e.key === 'Escape') cancelInlineEdit();
                }}
                onBlur={() => commitInlineEdit()}
              />
            ) : (
              <button
                type="button"
                className="truncate text-left text-sm font-semibold tracking-tight hover:underline underline-offset-4"
                onClick={beginInlineEdit}
              >
                {task.title}
              </button>
            )}
          </div>

          <div className="mt-1">
            {editing ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[84px]"
                placeholder="Add a short description…"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') cancelInlineEdit();
                }}
              />
            ) : (
              <button
                type="button"
                className="line-clamp-2 w-full text-left text-sm text-muted-foreground hover:text-foreground/90"
                onClick={beginInlineEdit}
              >
                {task.description || 'Add a description…'}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {priorityBadge(task.priority)}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDetailsOpen((v) => !v)}
            aria-label="Toggle details"
          >
            {detailsOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </div>

      <div className={cn('mt-4 space-y-3', dense && 'mt-3')}>
        <Progress value={progress} />
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1">
              <ListChecks className="h-4 w-4" />
              {totalCount ? (
                <>
                  {doneCount}/{totalCount} subtasks
                </>
              ) : (
                'No subtasks'
              )}
            </span>
            {due && (
              <span
                className={cn(
                  'inline-flex items-center gap-1',
                  overdue && 'text-red-400 font-medium'
                )}
              >
                <Calendar className={cn('h-4 w-4', overdue && 'text-red-400')} />
                {overdue ? 'Overdue · ' : 'Due '}{due}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onUpdateTask(task.id, { completed: !task.completed, status: task.completed ? 'todo' : 'done' })}
              aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
            >
              <CheckCircle2 className={cn(task.completed ? 'text-emerald-300' : 'text-muted-foreground')} />
            </Button>
            <Button variant="ghost" size="icon" onClick={beginInlineEdit} aria-label="Edit task">
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDeleteTask(task.id)} aria-label="Delete task">
              <Trash2 />
            </Button>
          </div>
        </div>
      </div>

      {detailsOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.18 }}
          className="mt-4 overflow-hidden rounded-lg border bg-background/40"
        >
          <div className={cn('p-3', dense && 'p-3')}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-xs font-medium text-muted-foreground">Status</div>
                <Select value={task.status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in-progress">In progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <div className="text-xs font-medium text-muted-foreground">Priority</div>
                <Select value={task.priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-medium text-muted-foreground">Subtasks</div>
              <div className="mt-2 space-y-2">
                {task.subtasks.length ? (
                  task.subtasks.map((s) => (
                    <label
                      key={s.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                    >
                      <Checkbox
                        checked={s.completed}
                        onCheckedChange={() => onToggleSubtask(task.id, s.id)}
                        aria-label={`Toggle subtask ${s.title}`}
                      />
                      <span className={cn('text-sm', s.completed && 'text-muted-foreground line-through')}>{s.title}</span>
                    </label>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No subtasks yet.</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

