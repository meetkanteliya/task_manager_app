import { TaskFilter as TaskFilterType } from "@/types/task";

type Props = {
  filter: TaskFilterType;
  setFilter: (value: TaskFilterType) => void;
};

const filters: Array<{ label: string; value: TaskFilterType }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
];

export default function TaskFilter({ filter, setFilter }: Props) {
  return (
    <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1 dark:bg-slate-950">
      {filters.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => setFilter(item.value)}
          className={`rounded-lg px-3 py-2 text-sm font-semibold ${
            filter === item.value
              ? "bg-white text-[#2563EB] shadow-sm dark:bg-slate-800"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
