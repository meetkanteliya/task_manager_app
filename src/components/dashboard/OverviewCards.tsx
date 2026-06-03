import { CheckCircle2, CircleDot, ListTodo } from "lucide-react";
import StatsCard from "./StatsCard";

type OverviewCardsProps = {
  stats: {
    total: number;
    pending: number;
    completed: number;
  };
};

export default function OverviewCards({ stats }: OverviewCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
      <StatsCard
        title="Total Tasks"
        value={stats.total}
        icon={ListTodo}
        tone="blue"
      />
      <StatsCard
        title="Pending Tasks"
        value={stats.pending}
        icon={CircleDot}
        tone="yellow"
      />
      <StatsCard
        title="Completed Tasks"
        value={stats.completed}
        icon={CheckCircle2}
        tone="green"
      />
    </section>
  );
}
