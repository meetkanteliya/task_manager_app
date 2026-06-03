<<<<<<< HEAD
import { Activity, Task } from "@/types/task";

const TASKS_KEY = "tasks";
const ACTIVITIES_KEY = "activities";
export const TASKS_UPDATED_EVENT = "taskflow:tasks-updated";
export const ACTIVITIES_UPDATED_EVENT = "taskflow:activities-updated";

export const saveTasks = (tasks: Task[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    window.dispatchEvent(new Event(TASKS_UPDATED_EVENT));
  }
};
=======
import { Notification, Task, TaskPriority, TaskStatus, UserPreferences } from '@/types/task';

const TASKS_KEY = 'tasks';
const NOTIFICATIONS_KEY = 'notifications';
const PREFERENCES_KEY = 'preferences';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
>>>>>>> 8dfdc84a6a4211af9a4e90fffc39dc288c6587fb

function isTaskPriority(value: unknown): value is TaskPriority {
  return value === 'low' || value === 'medium' || value === 'high';
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === 'todo' || value === 'in-progress' || value === 'done';
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string') return false;
  if (typeof value.title !== 'string') return false;
  if (typeof value.description !== 'string') return false;
  if (!isTaskPriority(value.priority)) return false;
  if (!isTaskStatus(value.status)) return false;
  if (!(typeof value.dueDate === 'string' || value.dueDate === null)) return false;
  if (typeof value.completed !== 'boolean') return false;
  if (!Array.isArray(value.subtasks)) return false;
  if (typeof value.createdAt !== 'string') return false;
  if (typeof value.updatedAt !== 'string') return false;

  for (const s of value.subtasks) {
    if (!isRecord(s)) return false;
    if (typeof s.id !== 'string') return false;
    if (typeof s.title !== 'string') return false;
    if (typeof s.completed !== 'boolean') return false;
  }

<<<<<<< HEAD
  try {
    const tasks = localStorage.getItem(TASKS_KEY);

    const parsedTasks = tasks ? (JSON.parse(tasks) as Task[]) : [];

    return parsedTasks.map((task) => ({
      ...task,
      subtasks: task.subtasks ?? [],
    }));
  } catch {
    return [];
  }
};

export const saveActivities = (activities: Activity[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
    window.dispatchEvent(new Event(ACTIVITIES_UPDATED_EVENT));
  }
};

export const getActivities = (): Activity[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const activities = localStorage.getItem(ACTIVITIES_KEY);

    return activities ? (JSON.parse(activities) as Activity[]) : [];
  } catch {
    return [];
  }
};

export const clearTasks = () => saveTasks([]);
export const clearActivities = () => saveActivities([]);

export const getLocalStorageUsage = () => {
  if (typeof window === "undefined") {
    return 0;
  }

  return [TASKS_KEY, ACTIVITIES_KEY].reduce((total, key) => {
    return total + (localStorage.getItem(key)?.length ?? 0);
  }, 0);
};
=======
  return true;
}

function isNotification(value: unknown): value is Notification {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string') return false;
  if (value.type !== 'due-soon' && value.type !== 'overdue' && value.type !== 'task-completed') return false;
  if (typeof value.taskId !== 'string') return false;
  if (typeof value.message !== 'string') return false;
  if (typeof value.read !== 'boolean') return false;
  if (typeof value.createdAt !== 'string') return false;
  return true;
}

function isPreferences(value: unknown): value is UserPreferences {
  if (!isRecord(value)) return false;
  if (value.theme !== 'light' && value.theme !== 'dark') return false;
  if (typeof value.sidebarCollapsed !== 'boolean') return false;
  return true;
}

export function getFromStorage<T>(
  key: string,
  validator: (value: unknown) => value is T,
  fallback: T
): T {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return validator(parsed) ? parsed : fallback;
  } catch (err) {
    console.error(`Failed to read "${key}" from storage`, err);
    return fallback;
  }
}

export function setToStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes('quota')) {
      console.error('Failed to write to storage: quota exceeded', err);
    } else {
      console.error(`Failed to write "${key}" to storage`, err);
    }
    return false;
  }
}

export function removeFromStorage(key: string): boolean {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`Failed to remove "${key}" from storage`, err);
    return false;
  }
}

export function clearStorage(): boolean {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
  try {
    localStorage.clear();
    return true;
  } catch (err) {
    console.error('Failed to clear storage', err);
    return false;
  }
}

export function saveTasks(tasks: Task[]): boolean {
  return setToStorage(TASKS_KEY, tasks);
}

export function getTasks(): Task[] {
  const tasks = getFromStorage(TASKS_KEY, (v): v is Task[] => Array.isArray(v) && v.every(isTask), []);
  return tasks;
}

export function saveNotifications(notifications: Notification[]): boolean {
  return setToStorage(NOTIFICATIONS_KEY, notifications);
}

export function getNotifications(): Notification[] {
  return getFromStorage(
    NOTIFICATIONS_KEY,
    (v): v is Notification[] => Array.isArray(v) && v.every(isNotification),
    []
  );
}

export function savePreferences(preferences: UserPreferences): boolean {
  return setToStorage(PREFERENCES_KEY, preferences);
}

export function getPreferences(): UserPreferences {
  return getFromStorage(PREFERENCES_KEY, isPreferences, { theme: 'light', sidebarCollapsed: false });
}
>>>>>>> 8dfdc84a6a4211af9a4e90fffc39dc288c6587fb
