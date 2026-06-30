"use client";

import { Calendar, AlertTriangle, Clock } from "lucide-react";

type Props = {
  startDate: Date | string | null;
  endDate: Date | string | null;
  status: string;
};

function getDaysDiff(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((to.getTime() - from.getTime()) / msPerDay);
}

function getSmartLabel(date: Date, prefix: "start" | "end", isCompleted: boolean): {
  label: string;
  color: string;
} {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = getDaysDiff(now, target);

  if (prefix === "start") {
    if (diff === 0) return { label: "Starts Today", color: "text-blue-600 dark:text-blue-400" };
    if (diff === 1) return { label: "Starts Tomorrow", color: "text-blue-600 dark:text-blue-400" };
    if (diff > 1) return { label: `Starts in ${diff} days`, color: "text-slate-500 dark:text-slate-400" };
    if (diff === -1) return { label: "Started yesterday", color: "text-slate-500 dark:text-slate-400" };
    return { label: `Started ${Math.abs(diff)} days ago`, color: "text-slate-500 dark:text-slate-400" };
  }

  // End date
  if (isCompleted) {
    return { label: "Completed", color: "text-violet-600 dark:text-violet-400" };
  }
  if (diff === 0) return { label: "Due Today", color: "text-amber-600 dark:text-amber-400" };
  if (diff === 1) return { label: "Ends Tomorrow", color: "text-amber-600 dark:text-amber-400" };
  if (diff > 1 && diff <= 7) return { label: `Due in ${diff} days`, color: "text-emerald-600 dark:text-emerald-400" };
  if (diff > 7) return { label: `Due in ${diff} days`, color: "text-slate-500 dark:text-slate-400" };
  if (diff === -1) return { label: "Overdue by 1 day", color: "text-red-600 dark:text-red-400" };
  return { label: `Overdue by ${Math.abs(diff)} days`, color: "text-red-600 dark:text-red-400" };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProjectTimeline({ startDate, endDate, status }: Props) {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const isCompleted = status === "COMPLETED" || status === "ARCHIVED";

  if (!start && !end) return null;

  const startLabel = start ? getSmartLabel(start, "start", false) : null;
  const endLabel = end ? getSmartLabel(end, "end", isCompleted) : null;

  // Check overdue
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const isOverdue = end && !isCompleted && new Date(end) < now;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {start && (
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-slate-400" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {formatDate(start)}
          </span>
          {startLabel && (
            <span className={`text-[10px] font-semibold ${startLabel.color}`}>
              · {startLabel.label}
            </span>
          )}
        </div>
      )}

      {start && end && (
        <span className="text-slate-300 dark:text-slate-600">→</span>
      )}

      {end && (
        <div className="flex items-center gap-1.5">
          <Clock size={12} className={isOverdue ? "text-red-500" : "text-slate-400"} />
          <span className={`text-xs font-medium ${isOverdue ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-400"}`}>
            {formatDate(end)}
          </span>
          {endLabel && (
            <span className={`text-[10px] font-semibold ${endLabel.color}`}>
              · {endLabel.label}
            </span>
          )}
        </div>
      )}

      {isOverdue && (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-950/30 dark:text-red-400">
          <AlertTriangle size={10} />
          Overdue
        </span>
      )}
    </div>
  );
}
