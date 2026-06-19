import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import RoleDropdown from "./RoleDropdown";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard?error=unauthorized");
  }

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const currentUserId = session.user.id;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Z"/>
                <path d="M19.5 15.5a8.38 8.38 0 0 1-15 0"/>
                <path d="M2 21a10 10 0 0 1 20 0"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#2563EB] dark:text-blue-400">
                Administration
              </p>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                User Management
              </h1>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Strip */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(["ADMIN", "MANAGER", "MEMBER", "VIEWER"] as const).map((role) => {
            const count = users.filter((u) => u.role === role).length;
            const colors: Record<string, { bg: string; text: string; dot: string }> = {
              ADMIN:   { bg: "bg-red-50 dark:bg-red-950/40",     text: "text-red-700 dark:text-red-400",       dot: "bg-red-500" },
              MANAGER: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400",   dot: "bg-amber-500" },
              MEMBER:  { bg: "bg-blue-50 dark:bg-blue-950/40",   text: "text-blue-700 dark:text-blue-400",     dot: "bg-blue-500" },
              VIEWER:  { bg: "bg-slate-50 dark:bg-slate-800/60", text: "text-slate-700 dark:text-slate-400",   dot: "bg-slate-400" },
            };
            const c = colors[role];
            return (
              <div
                key={role}
                className={`rounded-xl border border-slate-200/60 p-4 dark:border-slate-800 ${c.bg}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${c.dot}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>
                    {role}
                  </span>
                </div>
                <p className={`mt-1 text-2xl font-bold ${c.text}`}>{count}</p>
              </div>
            );
          })}
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                All Users
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {users.length} {users.length === 1 ? "user" : "users"}
              </span>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    User
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-xs font-bold text-white shadow-sm">
                          {(user.name?.[0] ?? user.email[0]).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                            {user.name ?? "—"}
                          </p>
                          {user.id === currentUserId && (
                            <span className="text-xs text-[#2563EB] dark:text-blue-400">You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <RoleDropdown
                        userId={user.id}
                        currentRole={user.role}
                        isSelf={user.id === currentUserId}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 sm:hidden">
            {users.map((user) => (
              <div key={user.id} className="space-y-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-sm font-bold text-white shadow-sm">
                    {(user.name?.[0] ?? user.email[0]).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                      {user.name ?? "—"}
                      {user.id === currentUserId && (
                        <span className="ml-2 text-xs text-[#2563EB] dark:text-blue-400">(You)</span>
                      )}
                    </p>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <RoleDropdown
                    userId={user.id}
                    currentRole={user.role}
                    isSelf={user.id === currentUserId}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}