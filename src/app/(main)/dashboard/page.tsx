"use client";

import Link from "next/link";
import OverviewCards from "@/components/dashboard/OverviewCards";
import RecentTask from "@/components/dashboard/RecentTask";
import EmptyState from "@/components/common/EmptyState";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import { useTasks } from "@/hooks/useTasks";

export default function DashboardPage() {
  const { tasks, stats } = useTasks();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">
            Workspace overview 
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
        </div>

        <Link
          href="/tasks/create"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto"
        >
          Create Task
        </Link>
      </div>

      <OverviewCards stats={stats} />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        {tasks.length === 0 ? (
          <EmptyState
            title="Create your first task"
            description="Start building your backlog with a clear title and priority."
            actionHref="/tasks/create"
            actionLabel="Create Task"
          />
        ) : (
          <RecentTask tasks={tasks.slice(0, 5)} />
        )}

        <ActivityTimeline />
      </div>
    </div>
  );
}
