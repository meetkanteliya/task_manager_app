'use client';

import * as React from 'react';
import { useSidebarState } from '@/hooks/useSidebarState';

type SidebarContextValue = ReturnType<typeof useSidebarState>;

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

/**
 * Provides a single sidebar collapse state shared between:
 * - AppSidebar (toggle button)
 * - AppShell (reactive content padding)
 */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const sidebar = useSidebarState();
  return <SidebarContext.Provider value={sidebar}>{children}</SidebarContext.Provider>;
}

/**
 * Consume shared sidebar state.
 * Must be used inside <SidebarProvider>.
 */
export function useSidebarContext(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebarContext must be used within <SidebarProvider>');
  }
  return ctx;
}
