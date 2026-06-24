"use client";

import { useState, useEffect, useTransition } from "react";
import { Search, UserPlus, X, Check, Crown } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { searchUsers, addProjectMember } from "@/lib/actions/projects";
import { toast } from "sonner";

type SearchedUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

type ExistingMember = {
  userId: string;
};

type Props = {
  projectId: string;
  existingMembers: ExistingMember[];
  maxMembers?: number;
  onClose: () => void;
  onMemberAdded: () => void;
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
  MANAGER: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  MEMBER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  VIEWER: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export default function AddMemberDialog({
  projectId,
  existingMembers,
  maxMembers = 8,
  onClose,
  onMemberAdded,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debouncedQuery = useDebounce(query, 300);

  const existingIds = new Set(existingMembers.map((m) => m.userId));
  const isFull = existingMembers.length >= maxMembers;

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    searchUsers(debouncedQuery)
      .then((users) => setResults(users))
      .catch(() => setResults([]))
      .finally(() => setIsSearching(false));
  }, [debouncedQuery]);

  const handleAdd = (userId: string, isLeader: boolean = false) => {
    if (isFull) {
      toast.error(`Maximum ${maxMembers} members reached`);
      return;
    }

    startTransition(async () => {
      try {
        await addProjectMember(projectId, userId, isLeader);
        toast.success("Member added");
        onMemberAdded();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to add member");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Add Team Member
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {existingMembers.length}/{maxMembers} members
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <label className="relative mb-4 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            autoFocus
            className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none ring-[#2563EB]/20 placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

        {isFull && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400">
            Maximum {maxMembers} members reached. Remove a member before adding new ones.
          </div>
        )}

        {/* Results */}
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {isSearching && (
            <p className="py-6 text-center text-sm text-slate-400">Searching...</p>
          )}

          {!isSearching && debouncedQuery.trim().length >= 2 && results.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-400">
              No users found matching &ldquo;{debouncedQuery}&rdquo;
            </p>
          )}

          {!isSearching &&
            results.map((user) => {
              const isMember = existingIds.has(user.id);
              const initials = (user.name || user.email || "?")
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/30"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {user.name || "Unnamed"}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${ROLE_COLORS[user.role] || ROLE_COLORS.MEMBER}`}
                  >
                    {user.role}
                  </span>
                  {isMember ? (
                    <span className="flex items-center gap-1 shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                      <Check size={13} />
                      Added
                    </span>
                  ) : (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isPending || isFull}
                        onClick={() => handleAdd(user.id, false)}
                        className="flex items-center gap-1 rounded-lg bg-[#2563EB] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                      >
                        <UserPlus size={13} />
                        Add
                      </button>
                      <button
                        type="button"
                        disabled={isPending || isFull}
                        onClick={() => handleAdd(user.id, true)}
                        title="Add as Team Leader"
                        className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
                      >
                        <Crown size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
