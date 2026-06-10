"use client";

import { useRouter } from "next/navigation";
import TaskForm from "@/components/tasks/TaskForm";
import { useTasks } from "@/hooks/useTasks";
import { TaskPriority } from "@/types/task";

export default function CreateTaskPage() {
  const router = useRouter();
  const { addTask } = useTasks();

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
