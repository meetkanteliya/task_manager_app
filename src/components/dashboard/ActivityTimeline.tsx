"use client";

import {
  CheckCircle2,
  CirclePlus,
  GitBranchPlus,
  ListChecks,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { ActivityType } from "@/types/task";
import { formatDate } from "@/utils/dateFormatter";

const icons: Record<ActivityType, typeof CirclePlus> = {
  task_created: CirclePlus,
  task_completed: CheckCircle2,
  task_reopened: RotateCcw,
  task_deleted: Trash2,
  subtask_added: GitBranchPlus,
  subtask_completed: ListChecks,
};

export default function ActivityTimeline() {
  const { activities } = useTasks();
  const recentActivities = activities.slice(0, 10);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Activity Timeline
        </h2>
      </div>

      <div className="h-[380px] overflow-y-auto space-y-1 p-4">
        {recentActivities.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-600 dark:bg-slate-950 dark:text-slate-400">
            No activity recorded yet.
          </p>
        ) : (
          recentActivities.map((activity) => {
            const Icon = icons[activity.type];

            return (
              <div
                key={activity.id}
                className="flex gap-3 rounded-xl p-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/70"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] dark:bg-blue-950/50">
                  <Icon size={17} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {activity.message}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
