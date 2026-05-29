'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, Search, Settings, X } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AppSidebar } from '@/components/app-sidebar';
import { useTasksContext } from '@/context/tasks-context';
import { useDebounce } from '@/hooks/useDebounce';

export function AppHeader() {
  const { setSearchQuery } = useTasksContext();
  const [inputValue, setInputValue] = React.useState('');
  const debouncedValue = useDebounce(inputValue, 300);

  React.useEffect(() => {
    setSearchQuery(debouncedValue);
  }, [debouncedValue, setSearchQuery]);

  function clearSearch() {
    setInputValue('');
    setSearchQuery('');
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="flex h-14 items-center gap-3 px-4">

        {/* Mobile sidebar trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <AppSidebar className="h-full w-full" />
            </SheetContent>
          </Sheet>
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="global-search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search tasks by title or description…"
            className="h-10 pl-9 pr-9 md:max-w-[560px] bg-background/60"
            aria-label="Search tasks"
          />
          {inputValue && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            asChild
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Settings"
          >
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
