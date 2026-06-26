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
  UserCheck,
  Crown,
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

function MiniAvatar({ name, email, userId }: { name: string | null; email: string; userId: string }) {
  const initials = (name || email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const gradient = getGradient(userId);
  return (
    <div
      title={name || email}
      className={`flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[8px] font-bold text-white`}
    >
      {initials}
    </div>
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
  const [subtaskAssigneeId, setSubtaskAssigneeId] = useState("");
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
        await createProjectSubtask(
          task.id,
          subtaskTitle.trim(),
          subtaskAssigneeId || undefined
        );
        setSubtaskTitle("");
        setSubtaskAssigneeId("");
        setShowSubtaskInput(false);
        onRefresh();
        toast.success("Subtask added");
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

  const creatorName =
    task.createdById === currentUserId
      ? "You"
      : task.createdBy.name || task.createdBy.email;

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
            {/* Creator chip */}
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <User size={9} />
              {creatorName}
            </span>
          </div>
        </div>

        {/* Assignee avatar — always shown (creator if no explicit assignee) */}
        <div
          title={task.assignee ? `Assigned to: ${task.assignee.name || task.assignee.email}` : `Owner: ${task.createdBy.name || task.createdBy.email}`}
          className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${task.assignee ? getGradient(task.assignee.id) : getGradient(task.createdById)} text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900`}
        >
          {task.assignee
            ? assigneeInitials
            : (task.createdBy.name || task.createdBy.email || "?")
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
        </div>

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
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
            <User size={13} className="text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Created by{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {creatorName}
              </span>
            </span>
            {task.assignee && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <UserCheck size={13} className="text-[#2563EB] shrink-0" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Assigned to{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {task.assignee.name || task.assignee.email}
                  </span>
                </span>
              </>
            )}
          </div>

          {/* Assign Task To — checkbox list (one member at a time) */}
          {canEdit && (
            <div className="mb-4">
              <p className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <UserCheck size={12} />
                Assign Task To
                <span className="ml-auto text-[10px] font-normal text-slate-400">click to (un)assign</span>
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {members.map((m) => {
                  const isSelected = task.assigneeId === m.userId;
                  const initials = (m.user.name || m.user.email || "?")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const gradient = getGradient(m.user.id);
                  return (
                    <label
                      key={m.userId}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                        isSelected
                          ? "border-[#2563EB] bg-blue-50 dark:bg-blue-950/30"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleReassign(isSelected ? null : m.userId)}
                        disabled={isPending}
                        className="size-3.5 rounded accent-[#2563EB]"
                      />
                      <div
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[8px] font-bold text-white`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {m.user.name || "Unnamed"}
                          {m.userId === currentUserId && (
                            <span className="ml-1 text-[10px] font-normal text-slate-400">(You)</span>
                          )}
                        </p>
                        <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
                          {m.user.email}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Subtasks ── */}
          {totalSubtasks > 0 && (
            <div className="mb-4">
              <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <Check size={11} />
                Subtasks
                <span className="ml-auto rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-slate-800">
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </p>
              <div className="space-y-1.5">
                {task.subtasks.map((sub) => {
                  const subtaskAssignee = sub.assignee;
                  return (
                    <div
                      key={sub.id}
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors ${
                        sub.completed
                          ? "border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/10"
                          : "border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/30"
                      }`}
                    >
                      {/* Subtask checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(sub.id)}
                        disabled={isPending}
                        className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          sub.completed
                            ? "border-emerald-400 bg-emerald-500 text-white"
                            : "border-slate-300 bg-white hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-600 dark:bg-slate-800"
                        }`}
                      >
                        {sub.completed && <Check size={10} />}
                      </button>

                      {/* Subtask title */}
                      <span
                        className={`min-w-0 flex-1 text-sm ${
                          sub.completed
                            ? "text-slate-400 line-through dark:text-slate-500"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {sub.title}
                      </span>

                      {/* Subtask assignee — show assignee or fall back to task creator */}
                      {subtaskAssignee ? (
                        <div className="flex shrink-0 items-center gap-1.5">
                          <MiniAvatar
                            name={subtaskAssignee.name}
                            email={subtaskAssignee.name || ""}
                            userId={subtaskAssignee.id}
                          />
                          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                            {subtaskAssignee.id === currentUserId
                              ? "You"
                              : subtaskAssignee.name || "Unnamed"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex shrink-0 items-center gap-1.5">
                          <MiniAvatar
                            name={task.createdBy.name}
                            email={task.createdBy.email}
                            userId={task.createdById}
                          />
                          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                            {task.createdById === currentUserId ? "You" : task.createdBy.name || task.createdBy.email}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Add subtask form ── */}
          {canEdit && (
            <>
              {showSubtaskInput ? (
                <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/40">
                  <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    New Subtask
                  </p>
                  {/* Title input */}
                  <input
                    type="text"
                    value={subtaskTitle}
                    onChange={(e) => setSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                    placeholder="Subtask title..."
                    autoFocus
                    className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-[#2563EB] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />

                  {/* Assign to member — checkbox list */}
                  <div className="mb-3">
                    <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <UserCheck size={11} />
                      Assign to
                      <span className="ml-auto font-normal text-slate-400">click to (un)assign</span>
                    </p>
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-0.5">
                      {members.map((m) => {
                        const isSelected = subtaskAssigneeId === m.userId;
                        const initials = (m.user.name || m.user.email || "?")
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();
                        const gradient = getGradient(m.user.id);
                        return (
                          <label
                            key={m.userId}
                            className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${
                              isSelected
                                ? "bg-blue-50 dark:bg-blue-950/30"
                                : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                setSubtaskAssigneeId(isSelected ? "" : m.userId)
                              }
                              className="size-3.5 rounded accent-[#2563EB]"
                            />
                            <div
                              className={`flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[7px] font-bold text-white`}
                            >
                              {initials}
                            </div>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {m.user.name || m.user.email}
                              {m.userId === currentUserId && (
                                <span className="ml-1 text-[10px] font-normal text-slate-400">(You)</span>
                              )}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSubtaskInput(false);
                        setSubtaskTitle("");
                        setSubtaskAssigneeId("");
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddSubtask}
                      disabled={isPending || !subtaskTitle.trim()}
                      className="flex items-center gap-1 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Plus size={12} />
                      Add Subtask
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubtaskInput(true)}
                  className="mb-3 flex items-center gap-1 text-xs font-semibold text-[#2563EB] transition-colors hover:text-blue-700"
                >
                  <Plus size={13} />
                  Add subtask
                </button>
              )}
            </>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
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
