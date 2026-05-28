import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:flex">
        <AppSidebar className="h-full" />
      </div>

      <div className="md:pl-[248px]">
        <AppHeader />
        <main className="mx-auto w-full max-w-[1400px] p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

