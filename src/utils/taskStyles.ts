import { TaskPriority } from "@/types/task";

export function getPriorityBadgeClass(priority: TaskPriority) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize";

  if (priority === "high") {
    return `${base} bg-red-50 text-[#EF4444] dark:bg-red-950/40 dark:text-red-300`;
  }

  if (priority === "medium") {
    return `${base} bg-yellow-50 text-[#EAB308] dark:bg-yellow-950/40 dark:text-yellow-300`;
  }

  return `${base} bg-green-50 text-[#22C55E] dark:bg-green-950/40 dark:text-green-300`;
}

export function getStatusBadgeClass(completed: boolean) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";

  return completed
    ? `${base} bg-green-50 text-[#22C55E] dark:bg-green-950/40 dark:text-green-300`
    : `${base} bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300`;
}
