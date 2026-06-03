"use client";

import { FormEvent, useState } from "react";
import { Check, GitBranch, Plus, RotateCcw, Trash2, X } from "lucide-react";
import Button from "@/components/common/Button";
import { Task } from "@/types/task";
import { formatDate } from "@/utils/dateFormatter";
import { getPriorityBadgeClass, getStatusBadgeClass } from "@/utils/taskStyles";

type Props = {
  task: Task;
  deleteTask: (id: number) => void;
  toggleTask: (id: number) => void;
  addSubtask: (taskId: number, title: string) => void;
  toggleSubtask: (taskId: number, subtaskId: number) => void;
  deleteSubtask: (taskId: number, subtaskId: number) => void;
};

export default function TaskCard({
  task,
  deleteTask,
  toggleTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
}: Props) {
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length;

  const handleAddSubtask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!subtaskTitle.trim()) {
      return;
    }

    addSubtask(task.id, subtaskTitle.trim());
    setSubtaskTitle("");
  };

  return (
    <article className="flex min-h-80 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3
            className={`text-lg font-bold leading-7 text-slate-900 dark:text-slate-100 ${
              task.completed ? "text-slate-400 line-through dark:text-slate-500" : ""
            }`}
          >
            {task.title}
          </h3>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            Created {formatDate(task.createdAt)}
          </p>
        </div>

        <span className={getPriorityBadgeClass(task.priority)}>
          {task.priority}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className={getStatusBadgeClass(task.completed)}>
          {task.completed ? "Completed" : "Pending"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <GitBranch size={13} />
          {completedSubtasks}/{task.subtasks.length} subtasks
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="space-y-2">
          {task.subtasks.length === 0 ? (
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No subtasks yet.
            </p>
          ) : (
            task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 dark:bg-slate-900"
              >
                <button
                  type="button"
                  onClick={() => toggleSubtask(task.id, subtask.id)}
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    subtask.completed
                      ? "border-[#22C55E] bg-[#22C55E] text-white"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                  aria-label="Toggle subtask"
                >
                  {subtask.completed ? <Check size={13} /> : null}
                </button>

                <p
                  className={`min-w-0 flex-1 truncate text-sm font-medium text-slate-900 dark:text-slate-100 ${
                    subtask.completed ? "text-slate-500 line-through" : ""
                  }`}
                >
                  {subtask.title}
                </p>

                <button
                  type="button"
                  onClick={() => deleteSubtask(task.id, subtask.id)}
                  className="text-slate-400 hover:text-[#EF4444]"
                  aria-label="Delete subtask"
                >
                  <X size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddSubtask} className="mt-3 flex gap-2">
          <input
            value={subtaskTitle}
            onChange={(event) => setSubtaskTitle(event.target.value)}
            placeholder="Add subtask"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#2563EB] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            className="inline-flex size-10 items-center justify-center rounded-lg bg-[#2563EB] text-white hover:bg-blue-700"
            aria-label="Add subtask"
          >
            <Plus size={16} />
          </button>
        </form>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
        <Button
          onClick={() => toggleTask(task.id)}
          variant={task.completed ? "secondary" : "primary"}
          className="w-full gap-2"
        >
          {task.completed ? <RotateCcw size={16} /> : <Check size={16} />}
          {task.completed ? "Undo" : "Complete"}
        </Button>

        <Button
          onClick={() => deleteTask(task.id)}
          variant="danger"
          className="w-full gap-2"
        >
          <Trash2 size={16} />
          Delete
        </Button>
      </div>
    </article>
  );
}
