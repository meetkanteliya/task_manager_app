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