"use client";

import { FormEvent, useState } from "react";
import { Check, GitBranch, Plus, RotateCcw, Trash2, X, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import Button from "@/components/common/Button";
import { Task, TaskPriority } from "@/types/task";
import { formatDate } from "@/utils/dateFormatter";

type Props = {
  task: Task;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  editTask: (
    id: string,
    updates: { title?: string; description?: string; priority?: TaskPriority; dueDate?: string | null }
  ) => void;
  userRole?: string;
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
  userRole = "MEMBER",
}: Props) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const role = (userRole ?? session?.user?.role ?? "MEMBER") as string;
  const isOwner = task.userId === currentUserId;
  const createdByLabel = isOwner ? "You" : (task.user?.name ?? "Unknown");

  // RBAC: who can edit/delete
  const canEdit =
    role === "ADMIN" ||
    ((role === "MANAGER" || role === "MEMBER") && isOwner);
  // canEdit is false for VIEWER (falls through all conditions)

  const [isOpen, setIsOpen] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");

  // Edit form state
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progressPct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleAddSubtask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subtaskTitle.trim()) return;
    addSubtask(task.id, subtaskTitle.trim());
    setSubtaskTitle("");
  };

  const openModal = () => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority);
    setDueDate(task.dueDate ?? "");
    setIsOpen(true);
  };

  const closeModalAndSave = () => {
    setIsOpen(false);
    
    // Auto-save logic: Check if any fields changed
    const hasChanged = 
      title.trim() !== task.title ||
      description.trim() !== (task.description ?? "") ||
      priority !== task.priority ||
      (dueDate || null) !== (task.dueDate || null);

    if (hasChanged && title.trim() !== "") {
      editTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || null,
      });
    }
  };

  const displayDate = formatDisplayDate(task.dueDate);
  const dueDateStatus = getDueDateStatus(task.dueDate, task.completed);

  return (
    <>
      {/* Compact (Folded) Task Card */}
      <article
        onClick={openModal}
        className="
          group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm cursor-pointer
          transition-all duration-200 ease-out
          hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]
          dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900
          dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]
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
              Created by <span className="text-slate-500 dark:text-slate-400">{createdByLabel}</span> · {formatDate(task.createdAt)}
            </p>
          </div>

          <span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span>
        </div>

        {/* Status + due date row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex flex-wrap gap-2">
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
          
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            {totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks} subtasks` : "No subtasks"}
          </div>
        </div>

        {/* Subtask progress */}
        {totalSubtasks > 0 && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 mt-1">
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
      </article>

      {/* Unfolded (Pop-up Modal) Task Card */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModalAndSave}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Task Details
              </h2>
              <button
                type="button"
                onClick={closeModalAndSave}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!canEdit}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100"
                  placeholder="Task title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={!canEdit}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100"
                  placeholder="Add a description..."
                />
              </div>

              {/* Settings selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Subtasks Section */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <GitBranch size={13} />
                    Subtasks ({completedSubtasks}/{totalSubtasks})
                  </span>
                  <span>{progressPct}% Done</span>
                </div>
                
                {totalSubtasks > 0 && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-[#2563EB] transition-all duration-500 ease-out"
                      style={{ width: `${progressPct}%` }}
                      role="progressbar"
                    />
                  </div>
                )}

                {/* Subtask checklist */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/30">
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {task.subtasks.length === 0 ? (
                      <p className="text-sm font-medium text-slate-400 dark:text-slate-500 text-center py-2">
                        No subtasks added yet.
                      </p>
                    ) : (
                      task.subtasks.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 transition-colors dark:border-slate-800/80 dark:bg-slate-900"
                        >
                          <button
                            type="button"
                            onClick={() => toggleSubtask(task.id, subtask.id)}
                            className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                              subtask.completed
                                ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                                : "border-slate-300 hover:border-[#2563EB] dark:border-slate-600"
                            }`}
                            aria-label="Toggle subtask"
                          >
                            {subtask.completed ? <Check size={11} /> : null}
                          </button>
                          <p className={`min-w-0 flex-1 truncate text-sm font-medium ${
                            subtask.completed
                              ? "text-slate-400 line-through dark:text-slate-500"
                              : "text-slate-800 dark:text-slate-200"
                          }`}>
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

                  {/* Add subtask form inside checklist area */}
                  {canEdit && (
                    <form onSubmit={handleAddSubtask} className="mt-3 flex gap-2">
                      <input
                        value={subtaskTitle}
                        onChange={(e) => setSubtaskTitle(e.target.value)}
                        placeholder="Add subtask..."
                        className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                      />
                      <button
                        type="submit"
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-sm transition-colors hover:bg-blue-700"
                        aria-label="Add subtask"
                      >
                        <Plus size={16} />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            {canEdit && (
              <div className="flex gap-3 border-t border-slate-200/80 pt-4 dark:border-slate-800 mt-auto">
                <Button
                  onClick={() => toggleTask(task.id)}
                  variant={task.completed ? "secondary" : "primary"}
                  className="flex-1 gap-2"
                >
                  {task.completed ? <RotateCcw size={15} /> : <Check size={15} />}
                  {task.completed ? "Undo Completed" : "Mark Complete"}
                </Button>

                <Button
                  onClick={() => {
                    deleteTask(task.id);
                    setIsOpen(false);
                  }}
                  variant="danger"
                  className="flex-1 gap-2"
                >
                  <Trash2 size={15} />
                  Delete Task
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
