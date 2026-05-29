'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Kanban, LayoutGrid, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebarContext } from '@/context/sidebar-context';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/dashboard/boards', label: 'Boards', icon: Kanban },
] as const;

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isLoading } = useSidebarContext();
  const collapsed = isLoading ? false : isCollapsed;


  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50',
        collapsed ? 'w-[72px]' : 'w-[248px]',
        className
      )}
      aria-label="Sidebar"
    >
      <div className={cn('flex items-center gap-2 px-3 py-3', collapsed ? 'justify-center' : 'justify-between')}>
        <Link href="/dashboard" className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            <span className="font-semibold">TF</span>
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight">TaskFlow</span>
          )}
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(collapsed && 'hidden')}
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose />
        </Button>
      </div>

      <Separator />

      <nav className={cn('flex flex-1 flex-col gap-1 px-2 py-3', collapsed && 'px-1')} aria-label="Primary navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center px-2'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-foreground' : 'text-muted-foreground group-hover:text-accent-foreground')} />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className={cn('p-2', collapsed && 'flex justify-center')}>
        <Button
          type="button"
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(!collapsed && 'w-full justify-start')}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}

