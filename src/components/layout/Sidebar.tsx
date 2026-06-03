"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  PlusCircle,
  Settings,
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: ClipboardList,
  },
  {
    label: "Create Task",
    href: "/tasks/create",
    icon: PlusCircle,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { stats } = useTasks();

  const getIsActive = (href: string) => pathname === href;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-[#0F172A] px-5 py-6 text-white md:flex dark:bg-slate-950">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#2563EB] text-lg font-black">
            T
          </span>
          <div>
            <p className="text-lg font-bold">TaskFlow</p>
            <p className="text-xs text-slate-400">Project workspace</p>
          </div>
        </Link>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = getIsActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-lg shadow-blue-950/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-slate-700/80 bg-slate-800/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Task summary
          </p>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Total Tasks</span>
              <span className="font-bold">{stats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Pending Tasks</span>
              <span className="font-bold text-[#EAB308]">{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Completed Tasks</span>
              <span className="font-bold text-[#22C55E]">{stats.completed}</span>
            </div>
          </div>
        </div>
      </aside>

      <aside className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-[#0F172A] px-2 py-2 text-white md:hidden dark:bg-slate-950">
        <nav className="grid grid-cols-4 gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = getIsActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold ${
                  isActive
                    ? "bg-[#2563EB] text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
