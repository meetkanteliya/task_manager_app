"use client";

import Link from "next/link";
import { Users, CheckCircle2, FolderKanban, Crown } from "lucide-react";

type Member = {
  id: string;
  user: { id: string; name: string | null; email: string };
  isLeader: boolean;
};

type ProjectMemberCardProps = {
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

const HEALTH_CONFIG = {
  healthy: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    label: "On Track",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  warning: {
    border: "border-l-amber-500",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
    label: "At Risk",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  behind: {
    border: "border-l-red-500",
    badge: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
    label: "Behind",
    bar: "bg-red-500",
    dot: "bg-red-500",
  },
  empty: {
    border: "border-l-slate-300 dark:border-l-slate-600",
    badge: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    label: "No Tasks",
    bar: "bg-slate-300 dark:bg-slate-600",
    dot: "bg-slate-400",
  },
};

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
];

function getGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function getProjectHealth(tasks: { completed: boolean }[]) {
  if (tasks.length === 0) return "empty";
  const rate = tasks.filter((t) => t.completed).length / tasks.length;
  if (rate >= 0.6) return "healthy";
  if (rate >= 0.3) return "warning";
  return "behind";
}

export default function ProjectMemberCard({ project }: ProjectMemberCardProps) {
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const health = getProjectHealth(project.tasks);
  const cfg = HEALTH_CONFIG[health];

  const MAX_SHOWN = 3;
  const shownMembers = project.members.slice(0, MAX_SHOWN);
  const overflow = project.members.length - MAX_SHOWN;

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <div
        className={`relative flex flex-col overflow-hidden rounded-2xl border-l-4 ${cfg.border} border border-slate-200 bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900 dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]`}
      >
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] dark:bg-blue-950/30">
                <FolderKanban size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-[#2563EB] dark:text-slate-100 transition-colors">
                  {project.name}
                </h3>
              </div>
            </div>
            {/* Health badge */}
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${cfg.badge} flex items-center gap-1`}
            >
              <span className={`size-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>

          {/* Project badge label */}
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
            Project
          </span>

          {project.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {project.description}
            </p>
          )}

          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            by{" "}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {project.owner.name || project.owner.email}
            </span>
          </p>
        </div>

        {/* Progress */}
        <div className="px-5 pb-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
              <CheckCircle2 size={11} />
              Progress
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {completedTasks}/{totalTasks}
              <span className="ml-1 font-normal text-slate-400">tasks</span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="mt-1 text-right text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            {progress}% complete
          </p>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-slate-100 dark:border-slate-800" />

        {/* Members */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {shownMembers.map((m) => {
                const initials = (m.user.name || m.user.email || "?")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const gradient = getGradient(m.user.id);
                return (
                  <div
                    key={m.id}
                    title={`${m.user.name || m.user.email}${m.isLeader ? " (Leader)" : ""}`}
                    className={`relative flex size-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${gradient} text-[8px] font-bold text-white dark:border-slate-900`}
                  >
                    {initials}
                    {m.isLeader && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-2.5 items-center justify-center rounded-full bg-amber-400 shadow">
                        <Crown size={5} className="text-white" />
                      </span>
                    )}
                  </div>
                );
              })}
              {overflow > 0 && (
                <div className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[8px] font-bold text-slate-600 dark:border-slate-900 dark:bg-slate-700 dark:text-slate-300">
                  +{overflow}
                </div>
              )}
            </div>
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Users size={11} />
              {project.members.length} member{project.members.length !== 1 ? "s" : ""}
            </span>
          </div>

          <span className="text-xs font-semibold text-[#2563EB] opacity-0 transition-opacity group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
