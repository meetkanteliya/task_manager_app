export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  priority: TaskPriority;
  subtasks: Subtask[];
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

export interface Activity {
  id: number;
  type: ActivityType;
  message: string;
  createdAt: string;
}

export type TaskPriority = "low" | "medium" | "high";
export type TaskFilter = "all" | "pending" | "completed";
export type ActivityType =
  | "task_created"
  | "task_completed"
  | "task_deleted"
  | "subtask_added"
  | "subtask_completed";
