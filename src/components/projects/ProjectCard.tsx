"use client";

import Link from "next/link";
import { Calendar, Users, Crown, CheckCircle2, Clock } from "lucide-react";

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

function MemberList({ members }: { members: Member[] }) {
  const MAX_SHOWN = 3;
  const shown = members.slice(0, MAX_SHOWN);
  const overflow = members.length - MAX_SHOWN;

  if (members.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <Users size={13} />
        <span>No members yet</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Stacked avatars row */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {shown.map((m) => {
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
                className={`relative flex size-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${gradient} text-[9px] font-bold text-white dark:border-slate-900`}
              >
                {initials}
                {m.isLeader && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-amber-400 shadow">
                    <Crown size={6} className="text-white" />
                  </span>
                )}
              </div>
            );
          })}
          {overflow > 0 && (
            <div className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-bold text-slate-600 dark:border-slate-900 dark:bg-slate-700 dark:text-slate-300">
              +{overflow}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {members.length} member{members.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Named member list (up to 2 visible) */}
      <div className="space-y-1">
        {shown.slice(0, 2).map((m) => {
          const gradient = getGradient(m.user.id);
          const initials = (m.user.name || m.user.email || "?")
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return (
            <div key={m.id} className="flex items-center gap-2">
              <div
                className={`flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[8px] font-bold text-white`}
              >
                {initials}
              </div>
              <span className="truncate text-xs text-slate-600 dark:text-slate-400 flex-1">
                {m.user.name || m.user.email}
              </span>
              {m.isLeader && (
                <Crown size={10} className="shrink-0 text-amber-500" title="Team Leader" />
              )}
            </div>
          );
        })}
        {members.length > 2 && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 pl-7">
            +{members.length - 2} more member{members.length - 2 !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const health = getProjectHealth(project.tasks);
  const cfg = HEALTH_CONFIG[health];

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <div
        className={`relative flex flex-col overflow-hidden rounded-2xl border-l-4 ${cfg.border} border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900`}
      >
        {/* ── Header ── */}
        <div className="p-5 pb-3">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-[#2563EB] dark:text-slate-100 transition-colors">
                {project.name}
              </h3>
              {project.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {project.description}
                </p>
              )}
            </div>
            {/* Health badge */}
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${cfg.badge} flex items-center gap-1`}
            >
              <span className={`size-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>

          {/* Owner */}
          <p className="text-xs text-slate-400 dark:text-slate-500">
            by{" "}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {project.owner.name || project.owner.email}
            </span>
          </p>
        </div>

        {/* ── Progress ── */}
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
            />
          </div>
          <p className="mt-1 text-right text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            {progress}% complete
          </p>
        </div>

        {/* ── Divider ── */}
        <div className="mx-5 border-t border-slate-100 dark:border-slate-800" />

        {/* ── Members section ── */}
        <div className="px-5 py-3">
          <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <Users size={10} />
            Team Members
          </p>
          <MemberList members={project.members} />
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-5 py-3">
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Clock size={11} />
            {new Date(project.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="text-xs font-semibold text-[#2563EB] opacity-0 transition-opacity group-hover:opacity-100">
            View Project →
          </span>
        </div>
      </div>
    </Link>
  );
}
