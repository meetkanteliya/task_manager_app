"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ThemeToggle from "@/components/theme/ThemeToggle";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tasks": "Tasks",
  "/tasks/create": "Create Task",
  "/settings": "Settings",
};

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "MEMBER";
  const isViewer = role === "VIEWER";
  const title = pageTitles[pathname] ?? "TaskFlow";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            TaskFlow
          </p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {!isViewer && (
            <Link
              href="/tasks/create"
              aria-label="Create task"
              className="inline-flex size-10 items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-white shadow-sm hover:bg-blue-700 sm:size-auto sm:px-4 sm:py-2 sm:text-sm sm:font-semibold"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Create</span>
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
