"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

const MAX_PROJECT_MEMBERS = 8;

// ─── Auth Helpers ────────────────────────────────────────────────

async function getSessionWithRole() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

function requireRole(role: string, allowed: Role[]) {
  if (!allowed.includes(role as Role)) {
    throw new Error("You do not have permission to perform this action");
  }
}

// ─── Project CRUD ────────────────────────────────────────────────

/**
 * Create a new project. ADMIN/MANAGER only.
 * Creator is automatically set as owner and added as a member (leader).
 */
export async function createProject(name: string, description?: string) {
  const session = await getSessionWithRole();
  const role = session.user.role as Role;
  requireRole(role, ["ADMIN", "MANAGER"]);

  if (!name || name.trim().length === 0) {
    throw new Error("Project name is required");
  }

  const project = await db.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: session.user.id,
      },
    });

    // Auto-add creator as a member and leader
    await tx.projectMember.create({
      data: {
        projectId: created.id,
        userId: session.user.id,
        isLeader: true,
      },
    });

    // Log activity
    await tx.activity.create({
      data: {
        type: "project_created",
        message: `Created project "${created.name}"`,
        userId: session.user.id,
      },
    });

    return created;
  });

  revalidatePath("/projects");
  return project;
}

/**
 * Fetch all projects where the current user is an owner or a member.
 * Includes member count and task progress.
 */
export async function getProjects() {
  const session = await getSessionWithRole();

  const projects = await db.project.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      tasks: {
        select: { id: true, completed: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return projects;
}

/**
 * Get a single project by ID with full details.
 * Only accessible to project owner or members.
 */
export async function getProjectById(projectId: string) {
  const session = await getSessionWithRole();

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          subtasks: {
            include: {
              assignee: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Verify access: must be owner or member
  const isMember = project.members.some((m) => m.userId === session.user.id);
  const isOwner = project.ownerId === session.user.id;

  if (!isMember && !isOwner) {
    throw new Error("You do not have access to this project");
  }

  return project;
}

// ─── Member Management ───────────────────────────────────────────

/**
 * Add a user to a project. ADMIN/MANAGER only.
 * Enforces max 8 members per project.
 */
export async function addProjectMember(
  projectId: string,
  userId: string,
  isLeader: boolean = false
) {
  const session = await getSessionWithRole();
  const role = session.user.role as Role;
  requireRole(role, ["ADMIN", "MANAGER"]);

  // Verify project exists and user has access
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });

  if (!project) throw new Error("Project not found");

  // Check max members
  if (project.members.length >= MAX_PROJECT_MEMBERS) {
    throw new Error(`Projects can have a maximum of ${MAX_PROJECT_MEMBERS} members`);
  }

  // Check if already a member
  const existingMember = project.members.find((m) => m.userId === userId);
  if (existingMember) {
    throw new Error("User is already a member of this project");
  }

  // Verify target user exists
  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  });
  if (!targetUser) throw new Error("User not found");

  await db.projectMember.create({
    data: {
      projectId,
      userId,
      isLeader,
    },
  });

  // Log activity
  await db.activity.create({
    data: {
      type: "project_member_added",
      message: `Added ${targetUser.name || "a user"} to project "${project.name}"`,
      userId: session.user.id,
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

/**
 * Remove a user from a project. ADMIN/MANAGER only.
 * Cannot remove the project owner.
 */
export async function removeProjectMember(projectId: string, userId: string) {
  const session = await getSessionWithRole();
  const role = session.user.role as Role;
  requireRole(role, ["ADMIN", "MANAGER"]);

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, name: true },
  });

  if (!project) throw new Error("Project not found");

  // Cannot remove the owner
  if (project.ownerId === userId) {
    throw new Error("Cannot remove the project owner");
  }

  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    include: { user: { select: { name: true } } },
  });

  if (!member) throw new Error("User is not a member of this project");

  await db.projectMember.delete({
    where: { id: member.id },
  });

  // Log activity
  await db.activity.create({
    data: {
      type: "project_member_removed",
      message: `Removed ${member.user.name || "a user"} from project "${project.name}"`,
      userId: session.user.id,
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

/**
 * Search users by name or email for the add-member dialog.
 * Returns max 10 results. Requires ADMIN/MANAGER role.
 */
export async function searchUsers(query: string) {
  const session = await getSessionWithRole();
  const role = session.user.role as Role;
  requireRole(role, ["ADMIN", "MANAGER"]);

  if (!query || query.trim().length < 2) {
    return [];
  }

  const users = await db.user.findMany({
    where: {
      OR: [
        { name: { contains: query.trim(), mode: "insensitive" } },
        { email: { contains: query.trim(), mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    take: 10,
  });

  return users;
}

/**
 * Get all users for the add-member dropdown list.
 * Returns all users ordered by name. Requires ADMIN/MANAGER role.
 */
export async function getAllUsers() {
  const session = await getSessionWithRole();
  const role = session.user.role as Role;
  requireRole(role, ["ADMIN", "MANAGER"]);

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });

  return users;
}

// ─── Project Tasks ───────────────────────────────────────────────

/**
 * Create a task within a project. Must be a project member.
 */
export async function createProjectTask(
  projectId: string,
  title: string,
  options?: {
    description?: string;
    priority?: string;
    dueDate?: string;
    assigneeId?: string;
  }
) {
  const session = await getSessionWithRole();

  // Verify project membership
  const membership = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (!membership) throw new Error("You are not a member of this project");

  if (!title || title.trim().length === 0) {
    throw new Error("Task title is required");
  }

  // If assigneeId is provided, verify the assignee is a project member
  if (options?.assigneeId) {
    const assigneeMembership = await db.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: options.assigneeId } },
    });
    if (!assigneeMembership) {
      throw new Error("Assignee must be a project member");
    }
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });

  const task = await db.projectTask.create({
    data: {
      title: title.trim(),
      description: options?.description?.trim() || null,
      priority: (options?.priority as "low" | "medium" | "high") || "medium",
      dueDate: options?.dueDate ? new Date(options.dueDate) : null,
      projectId,
      assigneeId: options?.assigneeId || null,
      createdById: session.user.id,
    },
    include: {
      subtasks: true,
      assignee: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  // Log activity
  await db.activity.create({
    data: {
      type: "project_task_created",
      message: `Created task "${title}" in project "${project?.name}"`,
      userId: session.user.id,
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return task;
}

/**
 * Update a project task. Allowed for: assignee, task creator, or ADMIN/MANAGER.
 */
export async function updateProjectTask(
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: string | null;
    assigneeId?: string | null;
  }
) {
  const session = await getSessionWithRole();
  const role = session.user.role as Role;

  const task = await db.projectTask.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true, assigneeId: true, createdById: true },
  });
  if (!task) throw new Error("Task not found");

  // Permission check: ADMIN/MANAGER, assignee, or creator
  const isAssignee = task.assigneeId === session.user.id;
  const isCreator = task.createdById === session.user.id;
  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";

  if (!isAssignee && !isCreator && !isAdminOrManager) {
    throw new Error("You do not have permission to update this task");
  }

  // If reassigning, verify the new assignee is a project member
  if (updates.assigneeId) {
    const assigneeMembership = await db.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: updates.assigneeId } },
    });
    if (!assigneeMembership) {
      throw new Error("Assignee must be a project member");
    }
  }

  const updateData: Record<string, unknown> = {};
  if (updates.title !== undefined) updateData.title = updates.title.trim();
  if (updates.description !== undefined) updateData.description = updates.description?.trim() || null;
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  if (updates.dueDate !== undefined) {
    updateData.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
  }
  if (updates.assigneeId !== undefined) {
    updateData.assigneeId = updates.assigneeId || null;
  }

  const updated = await db.projectTask.update({
    where: { id: taskId },
    data: updateData,
    include: {
      subtasks: true,
      assignee: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${task.projectId}`);
  return updated;
}

/**
 * Delete a project task. ADMIN/MANAGER or task creator only.
 */
export async function deleteProjectTask(taskId: string) {
  const session = await getSessionWithRole();
  const role = session.user.role as Role;

  const task = await db.projectTask.findUnique({
    where: { id: taskId },
    select: { id: true, title: true, projectId: true, createdById: true },
  });
  if (!task) throw new Error("Task not found");

  const isCreator = task.createdById === session.user.id;
  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";

  if (!isCreator && !isAdminOrManager) {
    throw new Error("You do not have permission to delete this task");
  }

  await db.projectTask.delete({ where: { id: taskId } });

  // Log activity
  await db.activity.create({
    data: {
      type: "project_task_deleted",
      message: `Deleted task "${task.title}"`,
      userId: session.user.id,
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${task.projectId}`);
  return { success: true };
}

/**
 * Toggle a project task's completion status.
 * Allowed for: assignee, creator, or ADMIN/MANAGER.
 */
export async function toggleProjectTask(taskId: string) {
  const session = await getSessionWithRole();
  const role = session.user.role as Role;

  const task = await db.projectTask.findUnique({
    where: { id: taskId },
    include: { subtasks: true },
  });
  if (!task) throw new Error("Task not found");

  const isAssignee = task.assigneeId === session.user.id;
  const isCreator = task.createdById === session.user.id;
  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";

  if (!isAssignee && !isCreator && !isAdminOrManager) {
    throw new Error("You do not have permission to toggle this task");
  }

  const newCompleted = !task.completed;

  // Sync subtasks
  if (task.subtasks.length > 0) {
    await db.projectSubtask.updateMany({
      where: { projectTaskId: taskId },
      data: { completed: newCompleted },
    });
  }

  const updated = await db.projectTask.update({
    where: { id: taskId },
    data: {
      completed: newCompleted,
      completedAt: newCompleted ? new Date() : null,
    },
    include: {
      subtasks: true,
      assignee: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${task.projectId}`);
  return updated;
}

// ─── Project Subtasks ────────────────────────────────────────────

/**
 * Create a subtask within a project task.
 * Must be a project member.
 */
export async function createProjectSubtask(
  projectTaskId: string,
  title: string,
  assigneeId?: string
) {
  const session = await getSessionWithRole();

  const task = await db.projectTask.findUnique({
    where: { id: projectTaskId },
    select: { id: true, projectId: true, completed: true, title: true },
  });
  if (!task) throw new Error("Task not found");

  // Verify project membership
  const membership = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId: task.projectId, userId: session.user.id } },
  });
  if (!membership) throw new Error("You are not a member of this project");

  if (!title || title.trim().length === 0) {
    throw new Error("Subtask title is required");
  }

  // If assigneeId is provided, verify the assignee is a project member
  if (assigneeId) {
    const assigneeMembership = await db.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: assigneeId } },
    });
    if (!assigneeMembership) {
      throw new Error("Assignee must be a project member");
    }
  }

  const subtask = await db.projectSubtask.create({
    data: {
      title: title.trim(),
      projectTaskId,
      assigneeId: assigneeId || null,
    },
  });

  // If the parent task was completed, reopen it since a new pending subtask was added
  if (task.completed) {
    await db.projectTask.update({
      where: { id: projectTaskId },
      data: { completed: false, completedAt: null },
    });
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${task.projectId}`);
  return subtask;
}

/**
 * Toggle a project subtask's completion status.
 * Auto-syncs parent task completion based on all subtask states.
 */
export async function toggleProjectSubtask(subtaskId: string) {
  const session = await getSessionWithRole();

  const subtask = await db.projectSubtask.findUnique({
    where: { id: subtaskId },
    include: { projectTask: { select: { id: true, projectId: true, completed: true } } },
  });
  if (!subtask) throw new Error("Subtask not found");

  // Verify project membership
  const membership = await db.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: subtask.projectTask.projectId,
        userId: session.user.id,
      },
    },
  });
  if (!membership) throw new Error("You are not a member of this project");

  const updated = await db.projectSubtask.update({
    where: { id: subtaskId },
    data: { completed: !subtask.completed },
  });

  // Auto-sync parent task completion
  const allSubtasks = await db.projectSubtask.findMany({
    where: { projectTaskId: subtask.projectTask.id },
  });

  const allCompleted = allSubtasks.every((s) => s.completed);
  const parentWasCompleted = subtask.projectTask.completed;

  if (allCompleted && !parentWasCompleted) {
    await db.projectTask.update({
      where: { id: subtask.projectTask.id },
      data: { completed: true, completedAt: new Date() },
    });
  } else if (!allCompleted && parentWasCompleted) {
    await db.projectTask.update({
      where: { id: subtask.projectTask.id },
      data: { completed: false, completedAt: null },
    });
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${subtask.projectTask.projectId}`);
  return updated;
}

/**
 * Delete a project subtask.
 * Must be a project member.
 */
export async function deleteProjectSubtask(subtaskId: string) {
  const session = await getSessionWithRole();
  const subtask = await db.projectSubtask.findUnique({
    where: { id: subtaskId },
    include: { projectTask: { select: { projectId: true } } }
  });
  if (!subtask) throw new Error("Subtask not found");

  // Verify project membership
  const membership = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId: subtask.projectTask.projectId, userId: session.user.id } }
  });
  if (!membership) throw new Error("You are not a member of this project");

  await db.projectSubtask.delete({ where: { id: subtaskId } });
  revalidatePath("/projects");
  revalidatePath(`/projects/${subtask.projectTask.projectId}`);
  return { success: true };
}

// ─── Project Deletion ────────────────────────────────────────────

/**
 * Delete a project. ADMIN only, or project owner.
 */
export async function deleteProject(projectId: string) {
  const session = await getSessionWithRole();
  const role = session.user.role as Role;

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, ownerId: true },
  });
  if (!project) throw new Error("Project not found");

  const isOwner = project.ownerId === session.user.id;
  if (role !== "ADMIN" && !isOwner) {
    throw new Error("Only admins or the project owner can delete a project");
  }

  await db.project.delete({ where: { id: projectId } });

  // Log activity
  await db.activity.create({
    data: {
      type: "project_deleted",
      message: `Deleted project "${project.name}"`,
      userId: session.user.id,
    },
  });

  revalidatePath("/projects");
  return { success: true };
}
