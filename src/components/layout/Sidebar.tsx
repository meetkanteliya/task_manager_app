"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  Shield,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Logo from "@/components/common/Logo";

type Role = "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER";

const ROLE_BADGE: Record<Role, { label: string; bg: string; text: string }> = {
  ADMIN:   { label: "Admin",   bg: "bg-red-500/15 dark:bg-red-500/20",     text: "text-red-600 dark:text-red-400" },
  MANAGER: { label: "Manager", bg: "bg-blue-500/15 dark:bg-blue-500/20",    text: "text-blue-600 dark:text-blue-400" },
  MEMBER:  { label: "Member",  bg: "bg-emerald-500/15 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
  VIEWER:  { label: "Viewer",  bg: "bg-slate-500/15 dark:bg-slate-500/20",  text: "text-slate-500 dark:text-slate-400" },
};

function RoleBadge({ role }: { role: Role }) {
  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.MEMBER;
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
      {badge.label}
    </span>
  );
}

function UserProfile() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const role = (session.user.role as Role) ?? "MEMBER";

  const initials = (session.user.name || session.user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-800/60 p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{session.user.name}</p>
          <RoleBadge role={role} />
        </div>
        <p className="truncate text-xs text-slate-400">{session.user.email}</p>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-red-400"
        aria-label="Sign out"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user?.role as Role) ?? "MEMBER";

  const getIsActive = (href: string) => pathname === href;

  // Build navigation items conditionally based on role
  const navigation = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      visible: true,
    },
    {
      label: "Tasks",
      href: "/tasks",
      icon: ClipboardList,
      visible: true,
    },
    {
      label: "Create Task",
      href: "/tasks/create",
      icon: PlusCircle,
      visible: role !== "VIEWER",
    },
    {
      label: "Admin",
      href: "/admin",
      icon: Shield,
      visible: role === "ADMIN",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      visible: role === "ADMIN" || role === "MANAGER",
    },
  ];

  const visibleNav = navigation.filter((item) => item.visible);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-[#0F172A] px-5 py-6 text-white md:flex dark:bg-slate-950">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2">
          <Logo size="md" showText={false} />
          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              Task<span className="text-blue-500">Flow</span>
            </p>
            <p className="text-xs text-slate-400">Project workspace</p>
          </div>
        </Link>

        <nav className="space-y-1">
          {visibleNav.map((item) => {
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

        <div className="mt-auto space-y-4">
          {/* User profile */}
          <UserProfile />
        </div>
      </aside>

      <aside className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-[#0F172A] px-2 py-2 text-white md:hidden dark:bg-slate-950">
        <nav className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${Math.min(visibleNav.length, 5)}, minmax(0, 1fr))` }}>
          {visibleNav.slice(0, 5).map((item) => {
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
