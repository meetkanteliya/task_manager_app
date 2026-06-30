export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  priority: TaskPriority;
  subtasks: Subtask[];
  description?: string;
  dueDate?: string;
  completedAt?: string;
  userId: string;
  user: { id: string; name: string | null };
  isProjectTask?: boolean;
  projectName?: string;
  projectId?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  createdAt: string;
}

export type TaskPriority = "low" | "medium" | "high";
export type TaskFilter = "all" | "pending" | "completed";
export type ActivityType =
  | "task_created"
  | "task_completed"
  | "task_reopened"
  | "task_deleted"
  | "subtask_added"
  | "subtask_completed"
  | "project_created"
  | "project_deleted"
  | "project_member_added"
  | "project_member_removed"
  | "project_task_created"
  | "project_task_deleted"
  | "project_status_changed"
  | "project_task_completed"
  | "project_task_updated"
  | "project_subtask_completed"
  | "project_leader_assigned"
  | "project_leader_removed"
  | "project_resource_uploaded"
  | "project_resource_deleted"
  | "project_timeline_updated"
  | "project_archived";
