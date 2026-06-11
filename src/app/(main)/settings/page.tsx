"use client";

import { Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import { themeOptions } from "@/constants/theme";
import { useTasks } from "@/hooks/useTasks";
import { getLocalStorageUsage } from "@/utils/localStorage";
import { applyThemePreference } from "@/utils/theme";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { stats, activities, removeAllTasks, removeAllActivities } = useTasks();
  const [mounted, setMounted] = useState(false);
  const storageUsage = mounted ? getLocalStorageUsage() : 0;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">
          Workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Settings
        </h1>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Appearance
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = mounted && theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  applyThemePreference(option.value);
                  setTheme(option.value);
                }}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left ${
                  isActive
                    ? "border-[#2563EB] bg-blue-50 text-[#2563EB] dark:bg-blue-950/40"
                    : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={18} />
                <span className="font-semibold">{option.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          System Information
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Metric label="Total Tasks" value={stats.total} />
          <Metric label="Total Activities" value={activities.length} />
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Database Status
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Connected
                </span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" aria-label="Connected indicator" />
              </div>
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
              PostgreSQL + Prisma
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-950 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Danger Zone
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              Clear stored workspace data from this browser.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="danger"
              className="gap-2"
              onClick={() => {
                removeAllTasks();
              }}
            >
              <Trash2 size={16} />
              Clear All Tasks
            </Button>
            <Button
              variant="danger"
              className="gap-2"
              onClick={() => {
                removeAllActivities();
              }}
            >
              <Trash2 size={16} />
              Clear All Activities
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}
