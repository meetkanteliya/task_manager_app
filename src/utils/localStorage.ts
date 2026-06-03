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

export const getTasks = (): Task[] => {
  if (typeof window === "undefined") {
    return [];
  }

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
