'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { Plus, Sparkles, Trash2 } from 'lucide-react';

import type { TaskPriority, TaskStatus } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type DraftSubtask = { id: string; title: string };

export function TaskCreateDialog({
  onCreate,
  triggerVariant = 'secondary',
  triggerLabel = 'New task',
}: {
  onCreate: (task: {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string | null;
    subtasks: { id: string; title: string; completed: boolean }[];
    completed: boolean;
  }) => void;
  triggerVariant?: React.ComponentProps<typeof Button>['variant'];
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState<string>('');
  const [subtasks, setSubtasks] = useState<DraftSubtask[]>([]);
  const [subtaskText, setSubtaskText] = useState('');

  const canCreate = title.trim().length > 0;

  const dueISO = useMemo(() => {
    if (!dueDate) return null;
    // Convert yyyy-mm-dd into ISO at local noon (avoids timezone drift for display)
    const d = new Date(`${dueDate}T12:00:00`);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }, [dueDate]);

  function reset() {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setDueDate('');
    setSubtasks([]);
    setSubtaskText('');
  }

  function addDraftSubtask() {
    const t = subtaskText.trim();
    if (!t) return;
    setSubtasks((prev) => [...prev, { id: crypto.randomUUID(), title: t }]);
    setSubtaskText('');
  }

  function submit() {
    if (!canCreate) return;
    onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate: dueISO,
      subtasks: subtasks.map((s) => ({ id: s.id, title: s.title, completed: false })),
      completed: status === 'done',
    });
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant}>
          <Plus />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a task</DialogTitle>
          <DialogDescription>Capture the work with just enough structure—no clutter.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <div className="text-xs font-medium text-muted-foreground">Title</div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Refactor auth middleware"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
              }}
            />
          </div>

          <div className="grid gap-2">
            <div className="text-xs font-medium text-muted-foreground">Description</div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does success look like? Add context for future you."
              className="min-h-[110px]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="grid gap-2">
              <div className="text-xs font-medium text-muted-foreground">Priority</div>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="text-xs font-medium text-muted-foreground">Status</div>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in-progress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <div className="text-xs font-medium text-muted-foreground">Due date</div>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold tracking-tight">Subtasks</div>
                <div className="mt-1 text-xs text-muted-foreground">Optional, but great for progress and focus.</div>
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                Auto progress
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                value={subtaskText}
                onChange={(e) => setSubtaskText(e.target.value)}
                placeholder="Add a subtask…"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDraftSubtask();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addDraftSubtask}>
                Add
              </Button>
            </div>

            {subtasks.length > 0 && (
              <div className="mt-3 space-y-2">
                {subtasks.map((s) => (
                  <div key={s.id} className={cn('flex items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2')}>
                    <div className="min-w-0 truncate text-sm">{s.title}</div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setSubtasks((prev) => prev.filter((x) => x.id !== s.id))}
                      aria-label="Remove subtask"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={submit} disabled={!canCreate}>
              Create task
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Tip: press <span className="rounded border px-1 py-0.5">Ctrl</span>+
            <span className="rounded border px-1 py-0.5">Enter</span> to create quickly.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

