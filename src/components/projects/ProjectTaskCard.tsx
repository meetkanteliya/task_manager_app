"use client";

import { useState, useTransition } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Calendar,
  RotateCcw,
  Trash2,
  Plus,
  X,
  User,
} from "lucide-react";
import {
  toggleProjectTask,
  deleteProjectTask,
  createProjectSubtask,
  toggleProjectSubtask,
  updateProjectTask,
} from "@/lib/actions/projects";
import { toast } from "sonner";

type Subtask = {
  id: string;
  title: string;
  completed: boolean;
  assignee: { id: string; name: string | null } | null;
};

type ProjectTaskType = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: string;
  dueDate: Date | null;
  projectId: string;
  assigneeId: string | null;
  createdById: string;
  assignee: { id: string; name: string | null; email: string } | null;
  createdBy: { id: string; name: string | null; email: string };
  subtasks: Subtask[];
};

type ProjectMember = {
  userId: string;
  user: { id: string; name: string | null; email: string };
};

type Props = {
  task: ProjectTaskType;
  currentUserId: string;
  userRole: string;
  members: ProjectMember[];
  onRefresh: () => void;
};

const PRIORITY_BORDER: Record<string, string> = {
  high: "border-l-red-500",
  medium: "border-l-amber-500",
  low: "border-l-blue-500",
};

const PRIORITY_BADGE: Record<string, string> = {
  high: "bg-red-50 text-red-600 ring-red-200 dark:bg-red-950/50 dark:text-red-400 dark:ring-red-800/60",
  medium: "bg-amber-50 text-amber-600 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:ring-amber-800/60",
  low: "bg-blue-50 text-blue-600 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:ring-blue-800/60",
};

function DueDateBadge({ dueDate, completed }: { dueDate: Date | null; completed: boolean }) {
  if (!dueDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const isOverdue = !completed && due < now;
  const isDueToday = !completed && due.getTime() === now.getTime();

  const colorClass = isOverdue
    ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
    : isDueToday
      ? "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${colorClass}`}>
      <Calendar size={10} />
      {due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
    </span>
  );
}

export default function ProjectTaskCard({
  task,
  currentUserId,
  userRole,
  members,
  onRefresh,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  const isAssignee = task.assigneeId === currentUserId;
  const isCreator = task.createdById === currentUserId;
  const isAdminOrManager = userRole === "ADMIN" || userRole === "MANAGER";
  const canEdit = isAssignee || isCreator || isAdminOrManager;
  const canDelete = isCreator || isAdminOrManager;

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleProjectTask(task.id);
        onRefresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to toggle task");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteProjectTask(task.id);
        toast.success("Task deleted");
        onRefresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete task");
      }
    });
  };

  const handleAddSubtask = () => {
    if (!subtaskTitle.trim()) return;
    startTransition(async () => {
      try {
        await createProjectSubtask(task.id, subtaskTitle.trim());
        setSubtaskTitle("");
        setShowSubtaskInput(false);
        onRefresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to add subtask");
      }
    });
  };

  const handleToggleSubtask = (subtaskId: string) => {
    startTransition(async () => {
      try {
        await toggleProjectSubtask(subtaskId);
        onRefresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to toggle subtask");
      }
    });
  };

  const handleReassign = (assigneeId: string | null) => {
    startTransition(async () => {
      try {
        await updateProjectTask(task.id, { assigneeId });
        toast.success("Assignee updated");
        onRefresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to reassign");
      }
    });
  };

  const assigneeInitials = task.assignee
    ? (task.assignee.name || task.assignee.email || "?")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <div
      className={`overflow-hidden rounded-xl border-l-[3px] ${PRIORITY_BORDER[task.priority] || PRIORITY_BORDER.medium} border border-slate-200 bg-white shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900 ${
        task.completed ? "opacity-60" : ""
      }`}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Toggle button */}
        {canEdit && (
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
              task.completed
                ? "border-emerald-400 bg-emerald-500 text-white"
                : "border-slate-300 bg-white hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-600 dark:bg-slate-800"
            }`}
          >
            {task.completed && <Check size={12} />}
          </button>
        )}

        {/* Title + meta */}
        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <p
            className={`truncate text-sm font-semibold ${
              task.completed
                ? "text-slate-400 line-through dark:text-slate-500"
                : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {task.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ${PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.medium}`}
            >
              {task.priority}
            </span>
            <DueDateBadge dueDate={task.dueDate} completed={task.completed} />
            {totalSubtasks > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {completedSubtasks}/{totalSubtasks} subtasks
              </span>
            )}
          </div>
        </div>

        {/* Assignee avatar */}
        {task.assignee && (
          <div
            title={task.assignee.name || task.assignee.email}
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[9px] font-bold text-white"
          >
            {assigneeInitials}
          </div>
        )}

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
          {/* Description */}
          {task.description && (
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
              {task.description}
            </p>
          )}

          {/* Created by */}
          <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
            Created by{" "}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {task.createdById === currentUserId ? "You" : task.createdBy.name || task.createdBy.email}
            </span>
          </p>

          {/* Assignee dropdown */}
          {canEdit && (
            <div className="mb-3">
              <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                <User size={12} className="mr-1 inline" />
                Assignee
              </label>
              <select
                value={task.assigneeId || ""}
                onChange={(e) => handleReassign(e.target.value || null)}
                disabled={isPending}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-[#2563EB] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user.name || m.user.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subtasks */}
          {totalSubtasks > 0 && (
            <div className="mb-3 space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Subtasks
              </p>
              {task.subtasks.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(sub.id)}
                    disabled={isPending}
                    className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      sub.completed
                        ? "border-emerald-400 bg-emerald-500 text-white"
                        : "border-slate-300 hover:border-emerald-400 dark:border-slate-600"
                    }`}
                  >
                    {sub.completed && <Check size={10} />}
                  </button>
                  <span
                    className={`text-sm ${
                      sub.completed
                        ? "text-slate-400 line-through dark:text-slate-500"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {sub.title}
                  </span>
                  {sub.assignee && (
                    <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500">
                      → {sub.assignee.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add subtask */}
          {canEdit && (
            <>
              {showSubtaskInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={subtaskTitle}
                    onChange={(e) => setSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                    placeholder="Subtask title..."
                    autoFocus
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-[#2563EB] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    disabled={isPending || !subtaskTitle.trim()}
                    className="rounded-lg bg-[#2563EB] p-1.5 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubtaskInput(false);
                      setSubtaskTitle("");
                    }}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubtaskInput(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] transition-colors hover:text-blue-700"
                >
                  <Plus size={13} />
                  Add subtask
                </button>
              )}
            </>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            {canEdit && (
              <button
                type="button"
                onClick={handleToggle}
                disabled={isPending}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  task.completed
                    ? "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400"
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400"
                }`}
              >
                {task.completed ? <RotateCcw size={12} /> : <Check size={12} />}
                {task.completed ? "Reopen" : "Complete"}
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
              >
                <Trash2 size={12} />
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
