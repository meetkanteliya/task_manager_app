import Link from "next/link";
import { Task } from "@/types/task";
import { getPriorityBadgeClass, getStatusBadgeClass } from "@/utils/taskStyles";

type RecentTaskProps = {
  tasks: Task[];
};

export default function RecentTask({ tasks }: RecentTaskProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Recent Tasks
        </h2>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href="/tasks"
            className="flex cursor-pointer flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/70 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {task.title}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                {task.subtasks.length} subtasks
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={getStatusBadgeClass(task.completed)}>
                {task.completed ? "Completed" : "Pending"}
              </span>
              <span className={getPriorityBadgeClass(task.priority)}>
                {task.priority}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
