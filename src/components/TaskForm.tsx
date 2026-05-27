"use client";

import { useState } from "react";

type TaskFormProps = {
  addTask: (title: string) => void;
};

export default function TaskForm({ addTask }: TaskFormProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;

    addTask(title);

    setTitle("");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6 items-center">
      <textarea
        placeholder="Enter task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 border border-gray-300 bg-white text-black p-4 rounded-2xl outline-none resize-none h-24 focus:ring-2 focus:ring-gray-400 transition-all duration-300"
        rows={2}
      />

      <button
        onClick={handleSubmit}
        className="bg-gray-900 hover:bg-indigo-700 hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-300 text-white px-6 py-3 rounded-2xl font-medium sm:w-auto w-full min-w-[100px] h-16"
      >
        Add
      </button>
    </div>
  );
}