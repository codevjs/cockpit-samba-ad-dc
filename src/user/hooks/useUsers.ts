// User Data Management Hooks

import { useState, useEffect, useCallback } from 'react';
import { UserAPI } from '@/services/user-api';
import { ErrorHandler } from '@/lib/errors';
import type { 
  SambaUser, 
  FilterOptions, 
  SortOptions,
  PaginationOptions 
} from '@/types/samba';

export interface UseUsersOptions {
  autoFetch?: boolean;
  filters?: FilterOptions;
  sort?: SortOptions;
  pagination?: PaginationOptions;
}

export interface UseUsersReturn {
  users: SambaUser[];
  loading: boolean;
  error: string | null;
  total: number;
  
  // Actions
  refresh: () => Promise<void>;
  setFilters: (filters: FilterOptions) => void;
  setSort: (sort: SortOptions) => void;
  setPagination: (pagination: PaginationOptions) => void;
  clearError: () => void;
  
  // Current state
  filters: FilterOptions;
  sort?: SortOptions;
  pagination?: PaginationOptions;
}

export const useUsers = (options: UseUsersOptions = {}): UseUsersReturn => {
  const { 
    autoFetch = true, 
    filters: initialFilters = {}, 
    sort: initialSort, 
    pagination: initialPagination 
  } = options;

  const [users, setUsers] = useState<SambaUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<FilterOptions>(initialFilters);
  const [sort, setSortState] = useState<SortOptions | undefined>(initialSort);
  const [pagination, setPaginationState] = useState<PaginationOptions | undefined>(initialPagination);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedUsers = await UserAPI.list(filters);
      
      // Apply sorting if specified
      let sortedUsers = [...fetchedUsers];
      if (sort) {
        sortedUsers.sort((a, b) => {
          const aValue = (a as any)[sort.field];
          const bValue = (b as any)[sort.field];
          
          if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
      
      // Apply pagination if specified
      if (pagination) {
        const start = (pagination.page - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        sortedUsers = sortedUsers.slice(start, end);
      }
      
      setUsers(sortedUsers);
    } catch (err) {
      const apiError = ErrorHandler.handle(err, 'useUsers.fetchUsers', {
        showToast: false,
        rethrow: false,
      });
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [filters, sort, pagination]);

  const refresh = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  const setFilters = useCallback((newFilters: FilterOptions) => {
    setFiltersState(newFilters);
  }, []);

  const setSort = useCallback((newSort: SortOptions) => {
    setSortState(newSort);
  }, []);

  const setPagination = useCallback((newPagination: PaginationOptions) => {
    setPaginationState(newPagination);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchUsers();
    }
  }, [fetchUsers, autoFetch]);

  return {
    users,
    loading,
    error,
    total: users.length, // Note: This would need to be calculated differently with server-side pagination
    refresh,
    setFilters,
    setSort,
    setPagination,
    clearError,
    filters,
    sort,
    pagination,
  };
};

// Hook for managing a single user
export interface UseUserOptions {
  username: string;
  autoFetch?: boolean;
}

export interface UseUserReturn {
  user: SambaUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useUser = ({ username, autoFetch = true }: UseUserOptions): UseUserReturn => {
  const [user, setUser] = useState<SambaUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!username) return;

    try {
      setLoading(true);
      setError(null);
      
      const fetchedUser = await UserAPI.show(username);
      setUser(fetchedUser);
    } catch (err) {
      const apiError = ErrorHandler.handle(err, 'useUser.fetchUser', {
        showToast: false,
        rethrow: false,
      });
      setError(apiError.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const refresh = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch && username) {
      fetchUser();
    }
  }, [fetchUser, autoFetch, username]);

  return {
    user,
    loading,
    error,
    refresh,
    clearError,
  };
};