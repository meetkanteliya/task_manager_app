'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPreferences } from '@/types/task';
import { getPreferences, savePreferences } from '@/utils/localStorage';

type Theme = 'light' | 'dark';

/**
 * Custom hook for managing theme with localStorage persistence
 * Automatically applies theme changes and persists preferences
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const preferences = getPreferences();
      setThemeState(preferences.theme);
      
      // Apply theme to document
      applyThemeToDocument(preferences.theme);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading theme:', err);
      setIsLoading(false);
    }
  }, []);

  /**
   * Apply theme class to document element
   */
  const applyThemeToDocument = (newTheme: Theme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      
      // Add new theme class
      root.classList.add(newTheme);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          newTheme === 'dark' ? '#111827' : '#ffffff'
        );
      }
    }
  };

  /**
   * Set theme and persist to localStorage
   */
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Apply theme to document
    applyThemeToDocument(newTheme);
    
    // Save to localStorage
    try {
      const currentPreferences = getPreferences();
      const updatedPreferences: UserPreferences = {
        ...currentPreferences,
        theme: newTheme,
      };
      
      const success = savePreferences(updatedPreferences);
      if (!success) {
        console.error('Failed to save theme preference');
      }
    } catch (err) {
      console.error('Error saving theme:', err);
    }
  }, []);

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  /**
   * Check if current theme is dark
   */
  const isDark = theme === 'dark';

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    isLoading,
  };
}
