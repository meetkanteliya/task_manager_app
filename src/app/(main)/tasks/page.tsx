"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import EmptyState from "@/components/common/EmptyState";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFilter from "@/components/tasks/TaskFilter";
import { useTasks } from "@/hooks/useTasks";
import { TaskFilter as TaskFilterType } from "@/types/task";
import { TasksSkeleton } from "@/components/common/Skeleton";

export default function TasksPage() {
  const {
    tasks,
    deleteTask,
    toggleTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    editTask,
    isLoading,
  } = useTasks();
  const [filter, setFilter] = useState<TaskFilterType>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");

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

  const boardPendingTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        !task.completed &&
        task.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, tasks]);

  const boardCompletedTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.completed &&
        task.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, tasks]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">
            Backlog
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Tasks
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              List View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                viewMode === "board"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Board View
            </button>
          </div>

          <Link
            href="/tasks/create"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto"
          >
            Create Task
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
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

          {viewMode === "list" && (
            <TaskFilter filter={filter} setFilter={setFilter} />
          )}
        </div>
      </section>

      {/* List vs Board Render */}
      {isLoading ? (
        <TasksSkeleton count={3} />
      ) : viewMode === "list" ? (
        filteredTasks.length === 0 ? (
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
                editTask={editTask}
              />
            ))}
          </div>
        )
      ) : (
        /* Board View (Kanban columns) */
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pending Column */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800/40 dark:bg-slate-900/10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                Pending Tasks
              </h2>
              <span className="rounded-full bg-amber-100/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 text-xs font-bold">
                {boardPendingTasks.length}
              </span>
            </div>
            <div className="space-y-4">
              {boardPendingTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                  <p className="text-sm text-slate-400 dark:text-slate-500">No pending tasks</p>
                </div>
              ) : (
                boardPendingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    deleteTask={deleteTask}
                    toggleTask={toggleTask}
                    addSubtask={addSubtask}
                    toggleSubtask={toggleSubtask}
                    deleteSubtask={deleteSubtask}
                    editTask={editTask}
                  />
                ))
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800/40 dark:bg-slate-900/10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                Completed Tasks
              </h2>
              <span className="rounded-full bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-bold">
                {boardCompletedTasks.length}
              </span>
            </div>
            <div className="space-y-4">
              {boardCompletedTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                  <p className="text-sm text-slate-400 dark:text-slate-500">No completed tasks</p>
                </div>
              ) : (
                boardCompletedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    deleteTask={deleteTask}
                    toggleTask={toggleTask}
                    addSubtask={addSubtask}
                    toggleSubtask={toggleSubtask}
                    deleteSubtask={deleteSubtask}
                    editTask={editTask}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
