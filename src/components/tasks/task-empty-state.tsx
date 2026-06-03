'use client';

import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function TaskEmptyState({ onNewTask }: { onNewTask?: () => void }) {
  return (
    <div className="rounded-xl border bg-card p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-secondary text-secondary-foreground">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight">Nothing in your queue</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Add a task and keep the workspace lean. Subtasks drive progress automatically.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button variant="secondary" onClick={onNewTask}>
          New task
        </Button>
        <Button variant="outline">Templates</Button>
      </div>
    </div>
  );
}

