"use client";

import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import { useState, useEffect } from "react";
import { Task } from "@/types/task";

export default function Home() {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
      );
    }
  }, [tasks, mounted]);

  const addTask = (title: string) => {
    const newTask: Task = {
      id: Date.now(),
      title,
      completed: false,
    };

    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: number) => {
    const updatedTasks = tasks.filter(
      (task) => task.id !== id
    );

    setTasks(updatedTasks);
  };

  const toggleTask = (id: number) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return {
          ...task,
          completed: !task.completed,
        };
      }

      return task;
    });

    setTasks(updatedTasks);
  };

  const editTask = (
    id: number,
    title: string
  ) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return {
          ...task,
          title,
        };
      }

      return task;
    });

    setTasks(updatedTasks);
  };

  const filteredTasks = tasks.filter((task) => {

    if (filter === "completed") {
      return task.completed;
    }

    if (filter === "pending") {
      return !task.completed;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 px-3 py-6 sm:p-6">

      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-3xl shadow-2xl border border-gray-200">

        <h1 className="text-3xl sm:text-4xl text-gray-900 font-extrabold text-center tracking-tight">
          Task Manager
        </h1>

        <p className="mt-4 text-center text-gray-600 text-lg">
  Showing {filteredTasks.length} of {tasks.length} tasks
</p>

        <TaskForm addTask={addTask} />

        <div className="flex flex-wrap gap-3 mt-6">

          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              filter === "all"
                ? "bg-gray-900 text-white shadow-md scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("completed")}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              filter === "completed"
                ? "bg-gray-900 text-white shadow-md scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Completed
          </button>

          <button
            onClick={() => setFilter("pending")}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              filter === "pending"
                ? "bg-gray-900 text-white shadow-md scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Pending
          </button>

        </div>

        <TaskList
          tasks={filteredTasks}
          deleteTask={deleteTask}
          toggleTask={toggleTask}
          editTask={editTask}
        />

      </div>

    </div>
  );
}