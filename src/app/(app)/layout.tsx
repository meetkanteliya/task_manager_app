import { TasksProvider } from '@/context/tasks-context';
import { AppShell } from '@/components/app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TasksProvider>
      <AppShell>{children}</AppShell>
    </TasksProvider>
  );
}

