'use client';

import * as React from 'react';

import { SidebarProvider, useSidebarContext } from '@/context/sidebar-context';
import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';
import { cn } from '@/lib/utils';

/**
 * Inner shell — reads sidebar context to dynamically adjust content padding.
 * Extracted from AppShell so it can consume the SidebarProvider above it.
 */
function ShellInner({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isLoading } = useSidebarContext();
  // Avoid layout shift on first paint — treat as expanded until preference loads
  const collapsed = isLoading ? false : isCollapsed;

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed sidebar — hidden on mobile, shown on md+ */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:flex">
        <AppSidebar className="h-full" />
      </div>

      {/* Main content — shifts right based on sidebar width */}
      <div
        className={cn(
          'transition-[padding] duration-200 ease-in-out',
          collapsed ? 'md:pl-[72px]' : 'md:pl-[248px]'
        )}
      >
        <AppHeader />
        <main className="mx-auto w-full max-w-[1400px] p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

/**
 * Client shell that wraps the app layout.
 * Provides SidebarContext and handles responsive padding.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  );
}
