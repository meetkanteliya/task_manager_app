'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPreferences } from '@/types/task';
import { getPreferences, savePreferences } from '@/utils/localStorage';

/**
 * Custom hook for managing sidebar collapse state with localStorage persistence
 * Automatically saves state changes to localStorage
 */
export function useSidebarState() {
  const [isCollapsed, setIsCollapsedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    try {
      const preferences = getPreferences();
      setIsCollapsedState(preferences.sidebarCollapsed);
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
      const currentPreferences = getPreferences();
      const updatedPreferences: UserPreferences = {
        ...currentPreferences,
        sidebarCollapsed: collapsed,
      };
      
      const success = savePreferences(updatedPreferences);
      if (!success) {
        console.error('Failed to save sidebar state');
      }
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
