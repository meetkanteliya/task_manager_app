"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Eye } from "lucide-react";
import OverviewCards from "@/components/dashboard/OverviewCards";
import RecentTask from "@/components/dashboard/RecentTask";
import EmptyState from "@/components/common/EmptyState";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import { useTasks } from "@/hooks/useTasks";
import { StatsSkeleton, RecentTasksSkeleton, TimelineSkeleton } from "@/components/common/Skeleton";

type Role = "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";

const ROLE_BADGE_STYLES: Record<Role, string> = {
  ADMIN:   "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
  MANAGER: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  MEMBER:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  VIEWER:  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export default function DashboardPage() {
  const { tasks, stats, isLoading } = useTasks();
  const { data: session } = useSession();

  const role = (session?.user?.role as Role) ?? "MEMBER";
  const userName = session?.user?.name ?? "User";
  const isViewer = role === "VIEWER";

  return ( 
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">
            Workspace overview 
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome back, {userName}
            </h1>
            <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${ROLE_BADGE_STYLES[role]}`}>
              {role}
            </span>
          </div>
        </div>

        {!isViewer && (
          <Link
            href="/tasks/create"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto"
          >
            Create Task
          </Link>
        )}
      </div>

      {/* Viewer read-only notice */}
      {isViewer && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Eye size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Read-only access
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You can view tasks and activity but cannot create, edit, or delete tasks.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <OverviewCards stats={stats} />
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        {isLoading ? (
          <RecentTasksSkeleton />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="Create your first task"
            description="Start building your backlog with a clear title and priority."
            actionHref={isViewer ? undefined : "/tasks/create"}
            actionLabel={isViewer ? undefined : "Create Task"}
          />
        ) : (
          <RecentTask tasks={tasks.slice(0, 5)} />
        )}

        {isLoading ? (
          <TimelineSkeleton />
        ) : (
          <ActivityTimeline />
        )}
      </div>
    </div>
  );
}
