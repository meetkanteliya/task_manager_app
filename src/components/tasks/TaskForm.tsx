"use client";

import { FormEvent, useId, useState } from "react";
import { Plus, X } from "lucide-react";
import Button from "@/components/common/Button";
import { TaskPriority } from "@/types/task";

type TaskFormProps = {
  onCreate: (
    title: string,
    priority: TaskPriority,
    options: {
      description?: string;
      dueDate?: string;
      subtasks: { title: string }[];
    }
  ) => void;
  onCancel: () => void;
};

interface DraftSubtask {
  id: string;
  title: string;
}

export default function TaskForm({ onCreate, onCancel }: TaskFormProps) {
  const uid = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [subtasks, setSubtasks] = useState<DraftSubtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");

  // Today's date in YYYY-MM-DD — used as the minimum selectable date
  const todayStr = new Date().toLocaleDateString("en-CA"); // en-CA gives YYYY-MM-DD

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    // Block past due dates (defence-in-depth in case min attribute is bypassed)
    if (dueDate && dueDate < todayStr) return;
    // Flush any in-progress subtask input
    const finalSubtasks = subtaskInput.trim()
      ? [...subtasks, { id: Date.now().toString(), title: subtaskInput.trim() }]
      : subtasks;

    onCreate(title.trim(), priority, {
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      subtasks: finalSubtasks.filter((s) => s.title.trim()),
    });
  };

  function addSubtask() {
    const trimmed = subtaskInput.trim();
    if (!trimmed) return;
    setSubtasks((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, title: trimmed }]);
    setSubtaskInput("");
  }

  function handleSubtaskKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubtask();
    }
  }

  function updateSubtask(id: string, value: string) {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, title: value } : s)));
  }

  function removeSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
    >
      <div className="space-y-5">
        {/* Task Title */}
        <div>
          <label
            htmlFor={`${uid}-title`}
            className="text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Task Title
          </label>
          <input
            id={`${uid}-title`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write a concise task title"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-slate-900 outline-none ring-[#2563EB]/20 placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        {/* Task Description */}
        <div>
          <label
            htmlFor={`${uid}-description`}
            className="text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Description{" "}
            <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          </label>
          <textarea
            id={`${uid}-description`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add detailed task description..."
            rows={4}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-slate-900 outline-none ring-[#2563EB]/20 placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        {/* Priority + Due Date — side by side on sm+ */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`${uid}-priority`}
              className="text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Priority
            </label>
            <select
              id={`${uid}-priority`}
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm font-medium capitalize text-slate-900 outline-none ring-[#2563EB]/20 focus:border-[#2563EB] focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label
              htmlFor={`${uid}-duedate`}
              className="text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Due Date{" "}
              <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
            </label>
            <input
              id={`${uid}-duedate`}
              type="date"
              value={dueDate}
              min={todayStr}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-slate-900 outline-none ring-[#2563EB]/20 focus:border-[#2563EB] focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Subtasks{" "}
            <span className="font-normal text-slate-400 dark:text-slate-500">(optional)</span>
          </p>

          {/* Existing draft subtasks */}
          {subtasks.length > 0 && (
            <div className="mt-3 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
              <ul className="space-y-2">
                {subtasks.map((subtask) => (
                  <li
                    key={subtask.id}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                  >
                    {/* editable inline */}
                    <input
                      type="text"
                      value={subtask.title}
                      onChange={(e) => updateSubtask(subtask.id, e.target.value)}
                      className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                      aria-label={`Edit subtask: ${subtask.title}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeSubtask(subtask.id)}
                      className="shrink-0 text-slate-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
                      aria-label={`Remove subtask: ${subtask.title}`}
                    >
                      <X size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add new subtask row */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={handleSubtaskKeyDown}
              placeholder="Add a subtask and press Enter or +"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm font-medium text-slate-900 outline-none ring-[#2563EB]/20 placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={addSubtask}
              disabled={!subtaskInput.trim()}
              aria-label="Add subtask"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim()}>
          Create Task
        </Button>
      </div>
    </form>
  );
}
