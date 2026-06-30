"use client";

import { Users, ListTodo, CheckCircle2, CircleDot, AlertTriangle, Clock } from "lucide-react";

type Task = {
  id: string;
  completed: boolean;
  priority: string;
  dueDate: Date | string | null;
};

type Props = {
  memberCount: number;
  tasks: Task[];
};

export default function ProjectStats({ memberCount, tasks }: Props) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  
  const highPriorityTasks = tasks.filter(
    (t) => t.priority === "high" && !t.completed
  ).length;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const overdueTasks = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < now;
  }).length;

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-slate-50/50 dark:bg-[#040814] p-3 rounded-3xl border border-slate-100 dark:border-[#111827]">
      <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 items-stretch">
        
        {/* Total Members */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1E293B]/70 bg-white dark:bg-[#0B0F19] p-3.5 text-slate-900 dark:text-white flex flex-col justify-between min-h-[104px]">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500/20">
              <Users size={14} />
            </span>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">
              Members
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-3 pl-0.5">
            {memberCount}
          </p>
        </div>

        {/* Total Tasks */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1E293B]/70 bg-white dark:bg-[#0B0F19] p-3.5 text-slate-900 dark:text-white flex flex-col justify-between min-h-[104px]">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800">
              <ListTodo size={14} />
            </span>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">
              Total Tasks
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-3 pl-0.5">
            {totalTasks}
          </p>
        </div>

        {/* Completed Tasks */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1E293B]/70 bg-white dark:bg-[#0B0F19] p-3.5 text-slate-900 dark:text-white flex flex-col justify-between min-h-[104px]">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#22C55E] border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/20">
              <CheckCircle2 size={14} />
            </span>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">
              Completed
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-3 pl-0.5">
            {completedTasks}
          </p>
        </div>

        {/* Pending Tasks */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1E293B]/70 bg-white dark:bg-[#0B0F19] p-3.5 text-slate-900 dark:text-white flex flex-col justify-between min-h-[104px]">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-[#EAB308] border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/20">
              <CircleDot size={14} />
            </span>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">
              Pending
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-3 pl-0.5">
            {pendingTasks}
          </p>
        </div>

        {/* High Priority Tasks */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1E293B]/70 bg-white dark:bg-[#0B0F19] p-3.5 text-slate-900 dark:text-white flex flex-col justify-between min-h-[104px]">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-650 border border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-500/20">
              <AlertTriangle size={14} />
            </span>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">
              High Priority
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-3 pl-0.5">
            {highPriorityTasks}
          </p>
        </div>

        {/* Overdue Tasks */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1E293B]/70 bg-white dark:bg-[#0B0F19] p-3.5 text-slate-900 dark:text-white flex flex-col justify-between min-h-[104px]">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/40 dark:text-rose-450 dark:border-rose-500/20">
              <Clock size={14} />
            </span>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">
              Overdue
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-3 pl-0.5">
            {overdueTasks}
          </p>
        </div>

        {/* Completion Percentage */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#1E293B]/70 bg-white dark:bg-[#0B0F19] p-3.5 text-slate-900 dark:text-white flex flex-col justify-between min-h-[104px]">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500/20 text-[10px] font-black select-none">
              %
            </span>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">
              Completion
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-3 pl-0.5">
            {completionPercentage}%
          </p>
        </div>

      </div>
    </div>
  );
}
