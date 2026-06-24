"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Crown,
  Plus,
  Trash2,
  Users,
  AlertTriangle,
  UserMinus,
} from "lucide-react";
import {
  getProjectById,
  removeProjectMember,
  deleteProject,
} from "@/lib/actions/projects";
import ProjectTaskCard from "@/components/projects/ProjectTaskCard";
import AddMemberDialog from "@/components/projects/AddMemberDialog";
import AddTaskDialog from "@/components/projects/AddTaskDialog";
import { toast } from "sonner";

type ProjectType = Awaited<ReturnType<typeof getProjectById>>;

export default function ProjectDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const currentUserId = session?.user?.id ?? "";
  const role = (session?.user?.role ?? "MEMBER") as string;

  const [project, setProject] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadProject = useCallback(() => {
    if (!projectId) return;
    startTransition(async () => {
      try {
        const data = await getProjectById(projectId);
        setProject(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load project");
        router.push("/projects");
      } finally {
        setIsLoading(false);
      }
    });
  }, [projectId, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadProject();
    }
  }, [status, loadProject]);

  const handleDeleteProject = () => {
    startTransition(async () => {
      try {
        await deleteProject(projectId);
        toast.success("Project deleted successfully");
        router.push("/projects");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete project");
      }
    });
  };

  const handleRemoveMember = (userId: string) => {
    if (window.confirm("Are you sure you want to remove this member from the project?")) {
      startTransition(async () => {
        try {
          await removeProjectMember(projectId, userId);
          toast.success("Member removed successfully");
          loadProject();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Failed to remove member");
        }
      });
    }
  };

  if (status === "loading" || (status === "authenticated" && role !== "ADMIN" && role !== "MANAGER" && isLoading)) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900 lg:col-span-2" />
          <div className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
        </div>
      </div>
    );
  }

  if (!project) return null;

  // Permissions helper
  const isOwner = project.ownerId === currentUserId;
  const isAdmin = role === "ADMIN";
  const canDeleteProject = isAdmin || isOwner;

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.completed).length;

  // Map project members to type expected by ProjectTaskCard
  const mappedMembers = project.members.map((m) => ({
    userId: m.userId,
    user: {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
    },
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => router.push("/projects")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>
      </div>

      {/* Project Header Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                Active Project
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {project.description}
              </p>
            )}
            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
              Owned by{" "}
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {project.owner.name || project.owner.email}
              </span>
            </p>
          </div>

          {canDeleteProject && (
            <div className="relative shrink-0">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2 dark:border-red-900/30 dark:bg-red-950/20">
                  <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                    Confirm Delete?
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteProject}
                    disabled={isPending}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 sm:w-auto"
                >
                  <Trash2 size={16} />
                  Delete Project
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Grid Layout: Tasks (Left) and Team Members (Right) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tasks Section (Col Span 2) */}
        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Tasks
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTask(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <Plus size={14} />
              Add Task
            </button>
          </div>

          <div className="space-y-4">
            {project.tasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center dark:border-slate-800 dark:bg-slate-900">
                <AlertTriangle className="mx-auto text-slate-400" size={32} />
                <h3 className="mt-4 text-sm font-semibold text-slate-955 dark:text-slate-200">
                  No tasks created
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Get started by adding a task to this project.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddTask(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={12} />
                  Add Task
                </button>
              </div>
            ) : (
              project.tasks.map((task) => (
                <ProjectTaskCard
                  key={task.id}
                  task={task}
                  currentUserId={currentUserId}
                  userRole={role}
                  members={mappedMembers}
                  onRefresh={loadProject}
                />
              ))
            )}
          </div>
        </section>

        {/* Team Members Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Team Members
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {project.members.length} of 8 members limit
              </p>
            </div>
            {project.members.length < 8 && (
              <button
                type="button"
                onClick={() => setShowAddMember(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850"
              >
                <Users size={14} className="text-[#2563EB]" />
                Add Member
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {project.members.map((member) => {
                const initials = (member.user.name || member.user.email || "?")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const isMemberOwner = project.ownerId === member.userId;

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {member.user.name || "Unnamed"}
                        </span>
                        {member.isLeader && (
                          <span title="Team Leader">
                            <Crown
                              size={12}
                              className="text-amber-500"
                            />
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {member.user.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {member.user.role}
                      </span>
                      {!isMemberOwner && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.userId)}
                          title="Remove from project"
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
                        >
                          <UserMinus size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Dialogs */}
      {showAddMember && (
        <AddMemberDialog
          projectId={projectId}
          existingMembers={project.members}
          onClose={() => setShowAddMember(false)}
          onMemberAdded={() => {
            setShowAddMember(false);
            loadProject();
          }}
        />
      )}

      {showAddTask && (
        <AddTaskDialog
          projectId={projectId}
          members={project.members}
          onClose={() => setShowAddTask(false)}
          onCreated={() => {
            setShowAddTask(false);
            loadProject();
          }}
        />
      )}
    </div>
  );
}
