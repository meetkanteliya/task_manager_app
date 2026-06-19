"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Eye } from "lucide-react";
import TaskForm from "@/components/tasks/TaskForm";
import { useTasks } from "@/hooks/useTasks";
import { TaskPriority } from "@/types/task";

export default function CreateTaskPage() {
  const router = useRouter();
  const { addTask } = useTasks();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "MEMBER";
  const isViewer = role === "VIEWER";

  const handleCreate = (
    title: string,
    priority: TaskPriority,
    options: {
      description?: string;
      dueDate?: string;
      subtasks: { title: string }[];
    }
  ) => {
    addTask(title, priority, options);
    router.push("/tasks");
  };

  if (isViewer) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">
            Access restricted
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Read-only Access
          </h1>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Eye size={22} />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
              You cannot create tasks
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Your current role is <span className="font-semibold">Viewer</span>. Contact an admin to upgrade your permissions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">
          New issue
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Create Task
        </h1>
      </div>

      <TaskForm onCreate={handleCreate} onCancel={() => router.push("/tasks")} />
    </div>
  );
}
