"use client";

import Link from "next/link";
import { Calendar, Users } from "lucide-react";

type Member = {
  id: string;
  user: { id: string; name: string | null; email: string };
  isLeader: boolean;
};

type ProjectCardProps = {
  project: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    owner: { id: string; name: string | null; email: string };
    members: Member[];
    tasks: { id: string; completed: boolean }[];
  };
};

const PRIORITY_BORDER: Record<string, string> = {
  healthy: "border-l-emerald-500",
  warning: "border-l-amber-500",
  behind: "border-l-red-500",
  empty: "border-l-slate-400 dark:border-l-slate-600",
};

function getProjectHealth(tasks: { completed: boolean }[]) {
  if (tasks.length === 0) return "empty";
  const rate = tasks.filter((t) => t.completed).length / tasks.length;
  if (rate >= 0.6) return "healthy";
  if (rate >= 0.3) return "warning";
  return "behind";
}

function MemberAvatars({ members, max = 4 }: { members: Member[]; max?: number }) {
  const shown = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <div className="flex -space-x-2">
      {shown.map((m) => {
        const initials = (m.user.name || m.user.email || "?")
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return (
          <div
            key={m.id}
            title={m.user.name || m.user.email}
            className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-indigo-600 text-[10px] font-bold text-white dark:border-slate-900"
          >
            {initials}
          </div>
        );
      })}
      {overflow > 0 && (
        <div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold text-slate-600 dark:border-slate-900 dark:bg-slate-700 dark:text-slate-300">
          +{overflow}
        </div>
      )}
    </div>
  );
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const health = getProjectHealth(project.tasks);

  const progressBarColor =
    health === "healthy"
      ? "bg-emerald-500"
      : health === "warning"
        ? "bg-amber-500"
        : health === "behind"
          ? "bg-red-500"
          : "bg-slate-300 dark:bg-slate-600";

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <div
        className={`relative overflow-hidden rounded-2xl border-l-4 ${PRIORITY_BORDER[health]} border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900`}
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-[#2563EB] dark:text-slate-100">
              {project.name}
            </h3>
            {project.description && (
              <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Owner */}
        <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
          Owned by{" "}
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            {project.owner.name || project.owner.email}
          </span>
        </p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Progress
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {completedTasks}/{totalTasks} tasks
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <MemberAvatars members={project.members} />

          <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Users size={13} />
              {project.members.length}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {new Date(project.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
