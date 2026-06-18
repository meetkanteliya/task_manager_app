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
  | "subtask_completed";
