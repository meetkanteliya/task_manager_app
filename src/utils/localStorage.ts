import { Task } from "@/types/task";

const TASKS_KEY = "tasks";

export const saveTasks = (tasks: Task[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }
};

export const getTasks = (): Task[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const tasks = localStorage.getItem(TASKS_KEY);

  return tasks ? JSON.parse(tasks) : [];
};