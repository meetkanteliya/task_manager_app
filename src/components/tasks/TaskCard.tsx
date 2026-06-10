"use client";

import { FormEvent, useState } from "react";
import { Check, GitBranch, Pencil, Plus, RotateCcw, Trash2, X, Calendar } from "lucide-react";
import Button from "@/components/common/Button";
import { Task, TaskPriority } from "@/types/task";
import { formatDate } from "@/utils/dateFormatter";

type Props = {
  task: Task;
  deleteTask: (id: number) => void;
  toggleTask: (id: number) => void;
  addSubtask: (taskId: number, title: string) => void;
  toggleSubtask: (taskId: number, subtaskId: number) => void;
  deleteSubtask: (taskId: number, subtaskId: number) => void;
  editTask: (
    id: number,
    updates: { title?: string; description?: string; priority?: TaskPriority; dueDate?: string }
  ) => void;
};

function getPriorityBadgeClass(priority: TaskPriority) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize transition-colors";

  if (priority === "high") {
    return `${base} bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800/60`;
  }
  if (priority === "medium") {
    return `${base} bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800/60`;
  }
  return `${base} bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700`;
}

function getStatusBadgeClass(completed: boolean) {
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";
  return completed
    ? `${base} bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400`
    : `${base} bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300`;
}

function formatDisplayDate(value: string | undefined | null) {
  if (!value) return null;
  try {
    const d = new Date(value);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return null;
  }
}

type DueDateStatus = "overdue" | "due-today" | "upcoming" | "none";

function getDueDateStatus(dueDate: string | undefined | null, completed: boolean): DueDateStatus {
  if (!dueDate || completed) return "none";
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    if (due < today) return "overdue";
    if (due.getTime() === today.getTime()) return "due-today";
    return "upcoming";
  } catch {
    return "none";
  }
}

function getDueDateBadgeClass(status: DueDateStatus): string {
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold";
  if (status === "overdue") return `${base} bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400`;
  if (status === "due-today") return `${base} bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400`;
  return `${base} bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400`;
}

export default function TaskCard({
  task,
  deleteTask,
  toggleTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  editTask,
}: Props) {
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description ?? "");
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate ?? "");

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progressPct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleAddSubtask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subtaskTitle.trim()) return;
    addSubtask(task.id, subtaskTitle.trim());
    setSubtaskTitle("");
  };

  function openEdit() {
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ?? "");
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
  }

  function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;
    editTask(task.id, {
      title: trimmedTitle,
      description: editDescription.trim() || undefined,
      priority: editPriority,
      dueDate: editDueDate || undefined,
    });
    setEditOpen(false);
  }

  const displayDate = formatDisplayDate(task.dueDate);
  const dueDateStatus = getDueDateStatus(task.dueDate, task.completed);

  return (
    <>
      {/* Edit Modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Edit task"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeEdit}
            aria-hidden="true"
          />
          {/* Modal panel */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Edit Task
              </h2>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                aria-label="Close edit dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 p-6">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Task title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Optional description…"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={closeEdit}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Card */}
      <article
        className="
          group flex min-h-80 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm
          transition-all duration-200 ease-out
          hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]
          dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900
          dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]
        "
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3
              className={`text-base font-bold leading-6 text-slate-900 dark:text-slate-100 ${
                task.completed ? "text-slate-400 line-through dark:text-slate-500" : ""
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                {task.description}
              </p>
            )}
            <p className="mt-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
              Created {formatDate(task.createdAt)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span>
            {/* Edit icon button */}
            <button
              type="button"
              onClick={openEdit}
              aria-label="Edit task"
              className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <Pencil size={14} />
            </button>
          </div>
        </div>

        {/* Status + due date row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={getStatusBadgeClass(task.completed)}>
            {task.completed ? "Completed" : "Pending"}
          </span>
          {displayDate && (
            <span className={getDueDateBadgeClass(dueDateStatus)}>
              <Calendar size={11} />
              {dueDateStatus === "overdue" && "Overdue · "}
              {dueDateStatus === "due-today" && "Due Today · "}
              {displayDate}
            </span>
          )}
        </div>

        {/* Subtask progress */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <GitBranch size={13} />
              {totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks} subtasks` : "No subtasks"}
            </span>
            {totalSubtasks > 0 && (
              <span className="text-slate-400 dark:text-slate-500">{progressPct}%</span>
            )}
          </div>
          {totalSubtasks > 0 && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-[#2563EB] transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          )}
        </div>

        {/* Subtask list */}
        <div className="mt-4 flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="space-y-2">
            {task.subtasks.length === 0 ? (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                No subtasks yet.
              </p>
            ) : (
              task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 transition-colors dark:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => toggleSubtask(task.id, subtask.id)}
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                      subtask.completed
                        ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900"
                        : "border-slate-300 hover:border-[#2563EB] dark:border-slate-600"
                    }`}
                    aria-label="Toggle subtask"
                  >
                    {subtask.completed ? <Check size={11} /> : null}
                  </button>
                  <p
                    className={`min-w-0 flex-1 truncate text-sm font-medium ${
                      subtask.completed
                        ? "text-slate-400 line-through dark:text-slate-500"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {subtask.title}
                  </p>
                  <button
                    type="button"
                    onClick={() => deleteSubtask(task.id, subtask.id)}
                    className="text-slate-300 transition-colors hover:text-red-400 dark:text-slate-600 dark:hover:text-red-400"
                    aria-label="Delete subtask"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add subtask form */}
          <form onSubmit={handleAddSubtask} className="mt-3 flex gap-2">
            <input
              value={subtaskTitle}
              onChange={(e) => setSubtaskTitle(e.target.value)}
              placeholder="Add subtask"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-sm transition-colors hover:bg-blue-700"
              aria-label="Add subtask"
            >
              <Plus size={16} />
            </button>
          </form>
        </div>

        {/* Action buttons */}
        <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row">
          <Button
            onClick={() => toggleTask(task.id)}
            variant={task.completed ? "secondary" : "primary"}
            className="w-full gap-2"
          >
            {task.completed ? <RotateCcw size={15} /> : <Check size={15} />}
            {task.completed ? "Undo" : "Complete"}
          </Button>

          <Button
            onClick={() => deleteTask(task.id)}
            variant="danger"
            className="w-full gap-2"
          >
            <Trash2 size={15} />
            Delete
          </Button>
        </div>
      </article>
    </>
  );
}
