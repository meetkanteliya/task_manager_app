'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing sidebar collapse state with localStorage persistence
 */
export function useSidebarState() {
  const [isCollapsed, setIsCollapsedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved !== null) {
        setIsCollapsedState(saved === 'true');
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading sidebar state:', err);
      setIsLoading(false);
    }
  }, []);

  /**
   * Set sidebar collapsed state and persist to localStorage
   */
  const setIsCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    
    // Save to localStorage
    try {
      localStorage.setItem('sidebarCollapsed', String(collapsed));
    } catch (err) {
      console.error('Error saving sidebar state:', err);
    }
  }, []);

  /**
   * Toggle sidebar collapsed state
   */
  const toggleSidebar = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);

  /**
   * Collapse the sidebar
   */
  const collapse = useCallback(() => {
    setIsCollapsed(true);
  }, [setIsCollapsed]);

  /**
   * Expand the sidebar
   */
  const expand = useCallback(() => {
    setIsCollapsed(false);
  }, [setIsCollapsed]);

  return {
    isCollapsed,
    setIsCollapsed,
    toggleSidebar,
    collapse,
    expand,
    isLoading,
  };
}
