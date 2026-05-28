'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function PreviewCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border bg-card shadow-sm', className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
        </div>
        <Badge variant="subtle">Dashboard</Badge>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">My work</div>
            <div className="mt-1 text-lg font-semibold tracking-tight">Focus queue</div>
          </div>
          <div className="rounded-lg border bg-background px-3 py-1 text-xs text-muted-foreground">Search…</div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            { title: 'Ship auth refresh flow', desc: 'Rotate tokens, handle 401 retries, add tests.', p: 'High' },
            { title: 'Polish settings UI', desc: 'Keyboard support, spacing, sensible defaults.', p: 'Medium' },
            { title: 'Backlog triage', desc: 'Tag issues, remove duplicates, set ownership.', p: 'Low' },
            { title: 'Analytics baseline', desc: 'Define metrics and add weekly snapshot.', p: 'Medium' },
          ].map((t, i) => (
            <div key={i} className="rounded-xl border bg-background/40 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold tracking-tight">{t.title}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.desc}</div>
                </div>
                <Badge variant={t.p === 'High' ? 'danger' : t.p === 'Medium' ? 'warning' : 'subtle'}>{t.p}</Badge>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${30 + i * 15}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Subtasks</span>
                <span>{i + 1}/4</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroPreview() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PreviewCard />
    </motion.div>
  );
}

