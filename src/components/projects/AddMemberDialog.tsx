"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { Search, UserPlus, X, Check, Crown, Users, Loader2 } from "lucide-react";
import { getAllUsers, addProjectMember } from "@/lib/actions/projects";
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

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
];

function getGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export default function AddMemberDialog({
  projectId,
  existingMembers,
  maxMembers = 8,
  onClose,
  onMemberAdded,
}: Props) {
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState<SearchedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const existingIds = new Set(existingMembers.map((m) => m.userId));
  const isFull = existingMembers.length >= maxMembers;

  // Load all users once on mount
  useEffect(() => {
    getAllUsers()
      .then((users) => setAllUsers(users))
      .catch(() => setAllUsers([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Filter users by search query client-side
  const filteredUsers = useMemo(() => {
    if (!query.trim()) return allUsers;
    const q = query.trim().toLowerCase();
    return allUsers.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [allUsers, query]);

  const handleAdd = (userId: string, isLeader: boolean = false) => {
    if (isFull) {
      toast.error(`Maximum ${maxMembers} members reached`);
      return;
    }
    setAddingId(userId);
    startTransition(async () => {
      try {
        await addProjectMember(projectId, userId, isLeader);
        toast.success(isLeader ? "Added as Team Leader" : "Member added successfully");
        onMemberAdded();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to add member");
      } finally {
        setAddingId(null);
      }
    });
  };

  const addedCount = existingMembers.length;
  const remaining = maxMembers - addedCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mx-4 flex w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700/60 dark:bg-slate-900 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
              <Users size={18} className="text-[#2563EB]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Add Team Member
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {addedCount}/{maxMembers} members &middot;{" "}
                <span className={remaining > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}>
                  {remaining > 0 ? `${remaining} slot${remaining !== 1 ? "s" : ""} available` : "Project full"}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Search Bar ── */}
        <div className="px-6 pt-4 pb-3">
          <label className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employees by name, email or role..."
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={14} />
              </button>
            )}
          </label>

          {/* Stats row */}
          <div className="mt-2.5 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isLoading
                ? "Loading employees..."
                : `${filteredUsers.length} employee${filteredUsers.length !== 1 ? "s" : ""} ${query ? "found" : "available"}`}
            </p>
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs font-medium text-[#2563EB] hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* ── Full warning ── */}
        {isFull && (
          <div className="mx-6 mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400">
            ⚠ Max {maxMembers} members reached. Remove a member to add new ones.
          </div>
        )}

        {/* ── Employee List (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-4" style={{ maxHeight: "360px" }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin mb-3" />
              <p className="text-sm">Loading all employees...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Users size={32} className="mb-3 opacity-40" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                No employees found
              </p>
              {query && (
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Try a different search term
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredUsers.map((user) => {
                const isMember = existingIds.has(user.id);
                const isAdding = addingId === user.id && isPending;
                const initials = (user.name || user.email || "?")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const gradient = getGradient(user.id);

                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      isMember
                        ? "border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-950/20"
                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/20 dark:hover:border-slate-700 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-xs font-bold text-white shadow-sm`}
                    >
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {user.name || "Unnamed"}
                        </p>
                        <span
                          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                            ROLE_COLORS[user.role] || ROLE_COLORS.MEMBER
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                      {isMember ? (
                        <span className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <Check size={12} />
                          Added
                        </span>
                      ) : isAdding ? (
                        <div className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500">
                          <Loader2 size={12} className="animate-spin" />
                          Adding...
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isPending || isFull}
                            onClick={() => handleAdd(user.id, false)}
                            title="Add as member"
                            className="flex items-center gap-1 rounded-lg bg-[#2563EB] px-2.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <UserPlus size={12} />
                            Add
                          </button>
                          <button
                            type="button"
                            disabled={isPending || isFull}
                            onClick={() => handleAdd(user.id, true)}
                            title="Add as Team Leader"
                            className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5 text-xs font-semibold text-amber-700 transition-all hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
                          >
                            <Crown size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-3">
          <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <UserPlus size={12} className="text-[#2563EB]" />
              = Add as Member
            </span>
            <span className="flex items-center gap-1">
              <Crown size={12} className="text-amber-500" />
              = Add as Leader
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
