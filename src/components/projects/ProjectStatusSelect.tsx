"use client";

import { useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { updateProjectStatus } from "@/lib/actions/projects";
import {
  VALID_STATUS_TRANSITIONS,
  STATUS_LABELS,
  type ProjectStatusType,
} from "@/lib/validations/project";
import { toast } from "sonner";
import ProjectStatusBadge from "./ProjectStatusBadge";

type Props = {
  projectId: string;
  currentStatus: string;
  onStatusChanged: () => void;
};

export default function ProjectStatusSelect({
  projectId,
  currentStatus,
  onStatusChanged,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const current = currentStatus as ProjectStatusType;
  const validNext = VALID_STATUS_TRANSITIONS[current] || [];

  // Archived projects show badge only
  if (current === "ARCHIVED" || validNext.length === 0) {
    return <ProjectStatusBadge status={currentStatus} size="md" />;
  }

  const handleSelect = (newStatus: ProjectStatusType) => {
    setIsOpen(false);
    startTransition(async () => {
      try {
        await updateProjectStatus(projectId, newStatus);
        toast.success(`Status changed to ${STATUS_LABELS[newStatus]}`);
        onStatusChanged();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update status"
        );
      }
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <ProjectStatusBadge status={currentStatus} size="sm" />
        <ChevronDown size={12} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 z-50 mt-1 min-w-[160px] rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Change Status
            </p>
            {validNext.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleSelect(status)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ProjectStatusBadge status={status} size="sm" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
