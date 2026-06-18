import { CheckCircle2, CircleDot, ListTodo, Calendar, CalendarCheck } from "lucide-react";
import StatsCard from "./StatsCard";

type OverviewCardsProps = {
  stats: {
    totalTasks: number;
    pendingTasks: number;
    completedTasks: number;
    weeklyCompleted: number;
    monthlyCompleted: number;
  };
};

export default function OverviewCards({ stats }: OverviewCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatsCard
        title="Total Tasks"
        value={stats.totalTasks}
        icon={ListTodo}
        tone="blue"
      />
      <StatsCard
        title="Pending Tasks"
        value={stats.pendingTasks}
        icon={CircleDot}
        tone="yellow"
      />
      <StatsCard
        title="Completed Tasks"
        value={stats.completedTasks}
        icon={CheckCircle2}
        tone="green"
      />
      <StatsCard
        title="This Week"
        value={stats.weeklyCompleted}
        icon={Calendar}
        tone="indigo"
      />
      <StatsCard
        title="This Month"
        value={stats.monthlyCompleted}
        icon={CalendarCheck}
        tone="purple"
      />
    </section>
  );
}
