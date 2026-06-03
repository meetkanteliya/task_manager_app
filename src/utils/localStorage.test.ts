import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveTasks,
  getTasks,
  saveNotifications,
  getNotifications,
  savePreferences,
  getPreferences,
  getFromStorage,
  setToStorage,
  removeFromStorage,
  clearStorage,
} from './localStorage';
import { Task, Notification, UserPreferences } from '@/types/task';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Setup global mocks
beforeEach(() => {
  global.localStorage = localStorageMock as Storage;
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe('localStorage wrapper', () => {
  describe('Task operations', () => {
    it('should save and retrieve tasks correctly', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          priority: 'high',
          status: 'todo',
          dueDate: '2024-12-31T00:00:00.000Z',
          completed: false,
          subtasks: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const result = saveTasks(tasks);
      expect(result).toBe(true);

      const retrieved = getTasks();
      expect(retrieved).toEqual(tasks);
    });

    it('should return empty array when no tasks exist', () => {
      const tasks = getTasks();
      expect(tasks).toEqual([]);
    });

    it('should validate task structure and return empty array for invalid data', () => {
      // Manually set invalid data
      localStorage.setItem('tasks', JSON.stringify([{ invalid: 'data' }]));

      const tasks = getTasks();
      expect(tasks).toEqual([]);
    });

    it('should handle tasks with subtasks', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Parent Task',
          description: 'Task with subtasks',
          priority: 'medium',
          status: 'in-progress',
          dueDate: null,
          completed: false,
          subtasks: [
            { id: 's1', title: 'Subtask 1', completed: true },
            { id: 's2', title: 'Subtask 2', completed: false },
          ],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      saveTasks(tasks);
      const retrieved = getTasks();
      expect(retrieved).toEqual(tasks);
      expect(retrieved[0].subtasks).toHaveLength(2);
    });
  });

  describe('Notification operations', () => {
    it('should save and retrieve notifications correctly', () => {
      const notifications: Notification[] = [
        {
          id: 'n1',
          type: 'due-soon',
          taskId: 't1',
          message: 'Task due soon',
          read: false,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const result = saveNotifications(notifications);
      expect(result).toBe(true);

      const retrieved = getNotifications();
      expect(retrieved).toEqual(notifications);
    });

    it('should return empty array when no notifications exist', () => {
      const notifications = getNotifications();
      expect(notifications).toEqual([]);
    });

    it('should validate notification structure', () => {
      localStorage.setItem('notifications', JSON.stringify([{ invalid: 'data' }]));

      const notifications = getNotifications();
      expect(notifications).toEqual([]);
    });
  });

  describe('User preferences operations', () => {
    it('should save and retrieve preferences correctly', () => {
      const preferences: UserPreferences = {
        theme: 'dark',
        sidebarCollapsed: true,
      };

      const result = savePreferences(preferences);
      expect(result).toBe(true);

      const retrieved = getPreferences();
      expect(retrieved).toEqual(preferences);
    });

    it('should return default preferences when none exist', () => {
      const preferences = getPreferences();
      expect(preferences).toEqual({
        theme: 'light',
        sidebarCollapsed: false,
      });
    });

    it('should validate preferences structure and return defaults for invalid data', () => {
      localStorage.setItem('preferences', JSON.stringify({ invalid: 'data' }));

      const preferences = getPreferences();
      expect(preferences).toEqual({
        theme: 'light',
        sidebarCollapsed: false,
      });
    });
  });

  describe('Generic storage operations', () => {
    it('should handle quota exceeded error gracefully', () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw quotaError;
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      const result = setToStorage('test', { data: 'test' });
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('quota exceeded'),
        expect.anything()
      );

      consoleSpy.mockRestore();
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorage.setItem('test', 'invalid json {');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      const validator = (data: unknown): data is string => typeof data === 'string';
      const result = getFromStorage('test', validator, 'default');

      expect(result).toBe('default');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should remove items from storage', () => {
      localStorage.setItem('test', 'value');
      expect(localStorage.getItem('test')).toBe('value');

      const result = removeFromStorage('test');
      expect(result).toBe(true);
      expect(localStorage.getItem('test')).toBeNull();
    });

    it('should clear all storage', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      const result = clearStorage();
      expect(result).toBe(true);
      expect(localStorage.getItem('key1')).toBeNull();
      expect(localStorage.getItem('key2')).toBeNull();
    });
  });

  describe('Data validation', () => {
    it('should reject tasks with invalid priority', () => {
      const invalidTasks = [
        {
          id: '1',
          title: 'Test',
          description: 'Test',
          priority: 'invalid',
          status: 'todo',
          dueDate: null,
          completed: false,
          subtasks: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      localStorage.setItem('tasks', JSON.stringify(invalidTasks));
      const tasks = getTasks();
      expect(tasks).toEqual([]);
    });

    it('should reject tasks with invalid status', () => {
      const invalidTasks = [
        {
          id: '1',
          title: 'Test',
          description: 'Test',
          priority: 'high',
          status: 'invalid',
          dueDate: null,
          completed: false,
          subtasks: [],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      localStorage.setItem('tasks', JSON.stringify(invalidTasks));
      const tasks = getTasks();
      expect(tasks).toEqual([]);
    });

    it('should reject notifications with invalid type', () => {
      const invalidNotifications = [
        {
          id: 'n1',
          type: 'invalid',
          taskId: 't1',
          message: 'Test',
          read: false,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      localStorage.setItem('notifications', JSON.stringify(invalidNotifications));
      const notifications = getNotifications();
      expect(notifications).toEqual([]);
    });

    it('should reject preferences with invalid theme', () => {
      const invalidPrefs = {
        theme: 'invalid',
        sidebarCollapsed: true,
      };

      localStorage.setItem('preferences', JSON.stringify(invalidPrefs));
      const preferences = getPreferences();
      expect(preferences).toEqual({
        theme: 'light',
        sidebarCollapsed: false,
      });
    });
  });

  describe('SSR compatibility', () => {
    it('should handle missing localStorage gracefully', () => {
      // Temporarily remove localStorage
      const originalLocalStorage = global.localStorage;
      // @ts-expect-error - Testing SSR scenario
      delete global.localStorage;

      const tasks = getTasks();
      expect(tasks).toEqual([]);

      const result = saveTasks([]);
      expect(result).toBe(false);

      // Restore localStorage
      global.localStorage = originalLocalStorage;
    });
  });
});
