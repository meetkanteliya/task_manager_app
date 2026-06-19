"use client";

import { useTransition, useState } from "react";
import { updateUserRole } from "@/lib/actions/admin";
import type { Role } from "@/lib/permissions";

const ROLES: { value: Role; label: string; color: string }[] = [
  { value: "ADMIN",   label: "Admin",   color: "text-red-600 dark:text-red-400" },
  { value: "MANAGER", label: "Manager", color: "text-amber-600 dark:text-amber-400" },
  { value: "MEMBER",  label: "Member",  color: "text-blue-600 dark:text-blue-400" },
  { value: "VIEWER",  label: "Viewer",  color: "text-slate-500 dark:text-slate-400" },
];

export default function RoleDropdown({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string;
  currentRole: string;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as Role;
    if (newRole === currentRole) return;

    setError(null);
    setShowSuccess(false);

    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update role");
      }
    });
  }

  if (isSelf) {
    const meta = ROLES.find((r) => r.value === currentRole);
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 ${meta?.color ?? ""}`}
        title="You cannot change your own role"
      >
        {meta?.label ?? currentRole}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </span>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      <select
        defaultValue={currentRole}
        onChange={handleChange}
        disabled={isPending}
        className={`
          appearance-none rounded-lg border bg-white py-1.5 pl-3 pr-8 text-xs font-semibold shadow-sm
          transition-all focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30
          disabled:cursor-not-allowed disabled:opacity-50
          dark:bg-slate-800 dark:text-slate-200
          ${error
            ? "border-red-300 text-red-700 dark:border-red-700 dark:text-red-400"
            : showSuccess
              ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400"
              : "border-slate-200 text-slate-700 dark:border-slate-700"
          }
        `}
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      {/* Dropdown chevron */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-2 text-slate-400"
      >
        <path d="m6 9 6 6 6-6"/>
      </svg>

      {/* Spinner */}
      {isPending && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#2563EB]" />
      )}

      {/* Success indicator */}
      {showSuccess && !isPending && (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      )}

      {/* Error tooltip */}
      {error && (
        <span className="text-xs text-red-500" title={error}>
          ✕
        </span>
      )}
    </div>
  );
}
