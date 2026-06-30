"use client";

import {
  UserPlus,
  UserMinus,
  Crown,
  CheckCircle2,
  FileText,
  Settings2,
  Calendar,
  Trash2,
  Upload,
  Archive,
  PlusCircle,
  Edit,
} from "lucide-react";

type Activity = {
  id: string;
  type: string;
  message: string;
  createdAt: Date | string;
  user: { id: string; name: string | null; email: string };
};

type Props = {
  activities: Activity[];
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

const ACTIVITY_ICONS: Record<string, typeof UserPlus> = {
  PROJECT_CREATED: PlusCircle,
  MEMBER_ADDED: UserPlus,
  MEMBER_REMOVED: UserMinus,
  LEADER_ASSIGNED: Crown,
  LEADER_REMOVED: Crown,
  TASK_CREATED: PlusCircle,
  TASK_UPDATED: Edit,
  TASK_COMPLETED: CheckCircle2,
  SUBTASK_COMPLETED: CheckCircle2,
  STATUS_CHANGED: Settings2,
  TIMELINE_UPDATED: Calendar,
  RESOURCE_UPLOADED: Upload,
  RESOURCE_DELETED: Trash2,
  PROJECT_ARCHIVED: Archive,
};

const ACTIVITY_COLORS: Record<string, string> = {
  PROJECT_CREATED: "text-blue-500",
  MEMBER_ADDED: "text-emerald-500",
  MEMBER_REMOVED: "text-red-500",
  LEADER_ASSIGNED: "text-amber-500",
  LEADER_REMOVED: "text-amber-500",
  TASK_CREATED: "text-blue-500",
  TASK_UPDATED: "text-slate-500",
  TASK_COMPLETED: "text-emerald-500",
  SUBTASK_COMPLETED: "text-emerald-500",
  STATUS_CHANGED: "text-violet-500",
  TIMELINE_UPDATED: "text-blue-500",
  RESOURCE_UPLOADED: "text-cyan-500",
  RESOURCE_DELETED: "text-red-500",
  PROJECT_ARCHIVED: "text-slate-500",
};

function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ProjectActivityTimeline({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <FileText className="mx-auto text-slate-400" size={32} />
        <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-200">
          No activity yet
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Project activities will appear here as actions are performed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, idx) => {
        const Icon = ACTIVITY_ICONS[activity.type] || FileText;
        const iconColor = ACTIVITY_COLORS[activity.type] || "text-slate-400";
        const initials = (activity.user.name || activity.user.email || "?")
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        const gradient = getGradient(activity.user.id);

        return (
          <div key={activity.id} className="flex gap-3 py-2.5">
            {/* Timeline line + icon */}
            <div className="flex flex-col items-center">
              <div
                className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[8px] font-bold text-white`}
              >
                {initials}
              </div>
              {idx < activities.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-slate-200 dark:bg-slate-700" />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pb-2">
              <div className="flex items-start gap-2">
                <Icon size={13} className={`mt-0.5 shrink-0 ${iconColor}`} />
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {activity.message}
                </p>
              </div>
              <p className="mt-1 pl-5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                {getRelativeTime(activity.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
