import { LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  tone: "blue" | "yellow" | "green";
};

const tones = {
  blue: "bg-blue-50 text-[#2563EB]",
  yellow: "bg-yellow-50 text-[#EAB308]",
  green: "bg-green-50 text-[#22C55E]",
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  tone,
}: StatsCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {value}
          </p>
        </div>

        <span className={`flex size-12 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon size={22} />
        </span>
      </div>
    </article>
  );
}
