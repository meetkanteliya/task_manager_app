"use client";

import type { ProjectStatusType } from "@/lib/validations/project";
import { STATUS_LABELS } from "@/lib/validations/project";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  PLANNING: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  ACTIVE: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  ON_HOLD: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  COMPLETED: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-700 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  ARCHIVED: {
    bg: "bg-slate-100 dark:bg-slate-800/50",
    text: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-400",
  },
};

type Props = {
  status: string;
  size?: "sm" | "md";
};

export default function ProjectStatusBadge({ status, size = "sm" }: Props) {
  const key = status as ProjectStatusType;
  const style = STATUS_STYLES[key] || STATUS_STYLES.PLANNING;
  const label = STATUS_LABELS[key] || status;

  const sizeClasses = size === "md"
    ? "px-3 py-1.5 text-xs"
    : "px-2 py-0.5 text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wide ${style.bg} ${style.text} ${sizeClasses}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
}
