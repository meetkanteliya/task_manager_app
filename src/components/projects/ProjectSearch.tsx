"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

type Props = {
  onSearch: (query: string) => void;
};

export default function ProjectSearch({ onSearch }: Props) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div className="relative w-full sm:max-w-md">
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search projects by name or description..."
        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-700"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

// Pure helper function to facilitate easy future migration to server-side search
export function filterProjects<T extends { name: string; description: string | null }>(
  projects: T[],
  query: string
): T[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return projects;

  return projects.filter(
    (project) =>
      project.name.toLowerCase().includes(cleanQuery) ||
      (project.description && project.description.toLowerCase().includes(cleanQuery))
  );
}
