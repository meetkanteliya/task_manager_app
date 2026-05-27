"use client";

import { Task } from "@/types/task";
import { useState } from "react";

type TaskListProps = {
  tasks: Task[];
  deleteTask: (id: number) => void;
  toggleTask: (id: number) => void;
  editTask: (id: number, title: string) => void;
};

export default function TaskList({
  tasks,
  deleteTask,
  toggleTask,
  editTask,
}: TaskListProps) {

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  return (
    <div className="mt-5 space-y-3">

      {tasks.length === 0 && (
        <div className="bg-gray-200 border border-dashed border-gray-400 rounded-2xl p-10 text-center">
          <h2 className="text-xl font-semibold text-gray-600">
            No Tasks Found
          </h2>

          <p className="text-gray-500 mt-2">
            Add a new task to get started !
          </p>
        </div>
      )}

      {tasks.length > 0 &&
        tasks.map((task) => (
          <div
            key={task.id}
            className="bg-gray-200 hover:bg-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row sm:items-center gap-4 p-5 text-black border border-gray-300 rounded-2xl"
          >

            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="w-6 h-6 shrink-0 accent-indigo-600 cursor-pointer"
            />

            {editingId === task.id ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) =>
                  setEditedTitle(e.target.value)
                }
                className="flex-1 border border-gray-400 p-2 rounded-xl outline-none"
              />
            ) : (
              <p
                className={`flex-1 break-all ${
                  task.completed
                    ? "line-through text-gray-500"
                    : ""
                }`}
              >
                {task.title}
              </p>
            )}

            <div className="flex gap-3 w-full sm:w-auto">

              {editingId === task.id ? (
                <button
                  onClick={() => {
                    editTask(task.id, editedTitle);
                    setEditingId(null);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl flex-1 sm:flex-none"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingId(task.id);
                    setEditedTitle(task.title);
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-xl flex-1 sm:flex-none"
                >
                  Edit
                </button>
              )}

              <button
                onClick={() => deleteTask(task.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-xl flex-1 sm:flex-none"
              >
                Delete
              </button>

            </div>

          </div>
        ))}

    </div>
  );
}