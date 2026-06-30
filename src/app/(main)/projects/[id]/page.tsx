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
  Archive,
  ListTodo,
  History,
  FileText,
} from "lucide-react";
import {
  getProjectById,
  removeProjectMember,
  deleteProject,
} from "@/lib/actions/projects";
import ProjectTaskCard from "@/components/projects/ProjectTaskCard";
import AddMemberDialog from "@/components/projects/AddMemberDialog";
import AddTaskDialog from "@/components/projects/AddTaskDialog";
import ProjectStatusSelect from "@/components/projects/ProjectStatusSelect";
import ProjectTimeline from "@/components/projects/ProjectTimeline";
import ProjectActivityTimeline from "@/components/projects/ProjectActivityTimeline";
import ProjectResources from "@/components/projects/ProjectResources";
import ProjectStats from "@/components/projects/ProjectStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  // Permissions helpers
  const isOwner = project.ownerId === currentUserId;
  const isAdmin = role === "ADMIN";
  const canDeleteProject = isAdmin || isOwner;
  // Only ADMIN and MANAGER can add/remove members, or status change
  const canManageMembers = role === "ADMIN" || role === "MANAGER";
  const canChangeStatus = role === "ADMIN" || role === "MANAGER" || isOwner;

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Map project members to type expected by ProjectTaskCard
  const mappedMembers = project.members.map((m) => ({
    userId: m.userId,
    user: {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
    },
  }));

  const isArchived = project.status === "ARCHIVED";

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

      {/* Archived Banner Notice */}
      {isArchived && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Archive size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-950 dark:text-slate-100">
              Project Archived
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This workspace is archived and read-only. Tasks, team lists, and files cannot be created, updated, or deleted.
            </p>
          </div>
        </div>
      )}

      {/* Redesigned Project Header Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          
          {/* Identity & Timeline */}
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              {canChangeStatus && !isArchived ? (
                <ProjectStatusSelect
                  projectId={projectId}
                  currentStatus={project.status}
                  onStatusChanged={loadProject}
                />
              ) : (
                <span className="shrink-0">
                  <ProjectStatusSelect
                    projectId={projectId}
                    currentStatus={project.status}
                    onStatusChanged={loadProject}
                  />
                </span>
              )}
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              {project.name}
            </h1>
            
            {project.description && (
              <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-400 max-w-3xl">
                {project.description}
              </p>
            )}

            {/* Timeline Row */}
            <div className="pt-1">
              <ProjectTimeline
                startDate={project.startDate}
                endDate={project.endDate}
                status={project.status}
              />
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500">
              Workspace Owner:{" "}
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {project.owner.name || project.owner.email}
              </span>
            </p>
          </div>

          {/* Progress & Actions Section */}
          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:items-end shrink-0 w-full sm:w-auto">
            {/* Progress Section */}
            <div className="w-full sm:w-48 lg:text-right space-y-1.5">
              <div className="flex items-center justify-between text-xs lg:justify-end lg:gap-2">
                <span className="font-medium text-slate-500 dark:text-slate-400">Progress</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{progressPercentage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 lg:text-right">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>

            {/* Delete Workspace Button */}
            {canDeleteProject && (
              <div className="relative self-start sm:self-center lg:self-end">
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
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
                  >
                    <Trash2 size={16} />
                    Delete Project
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Statistics Strip */}
      <ProjectStats memberCount={project.members.length} tasks={project.tasks} />

      {/* Tabs Layout */}
      <Tabs defaultValue="tasks" className="w-full space-y-4">
        <TabsList className="flex items-center justify-start gap-1 p-1 bg-slate-100 rounded-xl max-w-md dark:bg-slate-800">
          <TabsTrigger value="tasks" className="flex items-center gap-1.5 py-2 px-3 text-xs rounded-lg transition-all dark:data-[state=active]:bg-slate-900">
            <ListTodo size={14} />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-1.5 py-2 px-3 text-xs rounded-lg transition-all dark:data-[state=active]:bg-slate-900">
            <Users size={14} />
            Team ({project.members.length})
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-1.5 py-2 px-3 text-xs rounded-lg transition-all dark:data-[state=active]:bg-slate-900">
            <FileText size={14} />
            Resources ({project.resources.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1.5 py-2 px-3 text-xs rounded-lg transition-all dark:data-[state=active]:bg-slate-900">
            <History size={14} />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* ── Tasks Tab ── */}
        <TabsContent value="tasks" className="outline-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tasks</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage development tickets and action items</p>
              </div>
              {!isArchived && (
                <button
                  type="button"
                  onClick={() => setShowAddTask(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  <Plus size={14} />
                  Add Task
                </button>
              )}
            </div>

            <div className="space-y-4">
              {project.tasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center dark:border-slate-800 dark:bg-slate-900">
                  <AlertTriangle className="mx-auto text-slate-400" size={32} />
                  <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-200">
                    No tasks created
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Get started by adding a task to this project workspace.
                  </p>
                  {!isArchived && (
                    <button
                      type="button"
                      onClick={() => setShowAddTask(true)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      <Plus size={12} />
                      Add Task
                    </button>
                  )}
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
          </div>
        </TabsContent>

        {/* ── Team Tab ── */}
        <TabsContent value="team" className="outline-none">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Team Members</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Project collaborators and leaders</p>
              </div>
              {canManageMembers && !isArchived && project.members.length < 8 && (
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

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 max-w-2xl">
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
                        {canManageMembers && !isMemberOwner && !isArchived && (
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
          </div>
        </TabsContent>

        {/* ── Resources Tab ── */}
        <TabsContent value="resources" className="outline-none">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Project Resources</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Important workspace attachments and files</p>
            </div>
            <ProjectResources
              projectId={projectId}
              resources={project.resources}
              isArchived={isArchived}
              canDelete={canDeleteProject}
              onRefresh={loadProject}
            />
          </div>
        </TabsContent>

        {/* ── Activity Tab ── */}
        <TabsContent value="activity" className="outline-none">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Activity History</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chronological history of all project changes</p>
            </div>
            <ProjectActivityTimeline activities={project.activities} />
          </div>
        </TabsContent>
      </Tabs>

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
