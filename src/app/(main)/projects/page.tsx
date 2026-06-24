"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus } from "lucide-react";
import { getProjects } from "@/lib/actions/projects";
import ProjectCard from "@/components/projects/ProjectCard";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";

type ProjectData = Awaited<ReturnType<typeof getProjects>>[number];

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user?.role ?? "MEMBER") as string;
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Redirect MEMBER/VIEWER if not involved in any projects
  useEffect(() => {
    if (status === "authenticated" && role !== "ADMIN" && role !== "MANAGER" && !isLoading && projects.length === 0) {
      router.replace("/dashboard");
    }
  }, [status, role, router, isLoading, projects]);

  const loadProjects = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch {
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      loadProjects();
    }
  }, [status, loadProjects]);

  if (status === "loading" || (status === "authenticated" && role !== "ADMIN" && role !== "MANAGER" && isLoading)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">
            Team workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Projects
          </h1>
        </div>

        {(role === "ADMIN" || role === "MANAGER") && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:w-auto"
          >
            <Plus size={16} />
            New Project
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-12">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] dark:bg-blue-950/30">
            <FolderKanban size={28} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-slate-100">
            No projects yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
            Create your first project to start collaborating with your team.
          </p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={16} />
            Create Project
          </button>
        </section>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      {showCreate && (
        <CreateProjectDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
}
