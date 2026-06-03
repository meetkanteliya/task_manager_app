<<<<<<< HEAD
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
=======
export type Theme = 'light' | 'dark';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  completed: boolean;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
};

export type NotificationType = 'due-soon' | 'overdue' | 'task-completed';

export type Notification = {
  id: string;
  type: NotificationType;
  taskId: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type UserPreferences = {
  theme: Theme;
  sidebarCollapsed: boolean;
};
>>>>>>> 8dfdc84a6a4211af9a4e90fffc39dc288c6587fb
