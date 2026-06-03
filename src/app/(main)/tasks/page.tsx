"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFilter from "@/components/tasks/TaskFilter";
import { useTasks } from "@/hooks/useTasks";
import { TaskFilter as TaskFilterType } from "@/types/task";

export default function TasksPage() {
  const {
    tasks,
    deleteTask,
    toggleTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useTasks();
  const [filter, setFilter] = useState<TaskFilterType>("all");
  const [search, setSearch] = useState("");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      if (filter === "completed") {
        return task.completed && matchesSearch;
      }

      if (filter === "pending") {
        return !task.completed && matchesSearch;
      }

      return matchesSearch;
    });
  }, [filter, search, tasks]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">
            Backlog
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Tasks
          </h1>
        </div>

        <Link
          href="/tasks/create"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto"
        >
          Create Task
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none ring-[#2563EB]/20 placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>

          <TaskFilter filter={filter} setFilter={setFilter} />
        </div>
      </section>

      {filteredTasks.length === 0 ? (
        <EmptyState
          title={tasks.length === 0 ? "Create your first task" : "No tasks found"}
          description={
            tasks.length === 0
              ? "Add a task to start tracking priorities and progress."
              : "Try a different search term or filter."
          }
          actionHref="/tasks/create"
          actionLabel="Create Task"
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              toggleTask={toggleTask}
              addSubtask={addSubtask}
              toggleSubtask={toggleSubtask}
              deleteSubtask={deleteSubtask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
