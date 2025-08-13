// User Data Management Hooks

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

  const queryClient = useQueryClient();
  const [filters, setFiltersState] = useState<FilterOptions>(initialFilters);
  const [sort, setSortState] = useState<SortOptions | undefined>(initialSort);
  const [pagination, setPaginationState] = useState<PaginationOptions | undefined>(initialPagination);

  // Use React Query for data fetching
  const { 
    data: users = [], 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => UserAPI.list(filters),
    enabled: autoFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const error = queryError ? (queryError as Error).message : null;

  // Apply sorting and filtering to the fetched data
  const processedUsers = useMemo(() => {
    let result = [...users];
    
    // Apply sorting if specified
    if (sort) {
      result.sort((a, b) => {
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
        result = result.slice(start, end);
      }
      
      return result;
    }, [users, sort, pagination]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const setFilters = useCallback((newFilters: FilterOptions) => {
    setFiltersState(newFilters);
    // Invalidate and refetch when filters change
    queryClient.invalidateQueries({ queryKey: ['users'] });
  }, [queryClient]);

  const setSort = useCallback((newSort: SortOptions) => {
    setSortState(newSort);
  }, []);

  const setPagination = useCallback((newPagination: PaginationOptions) => {
    setPaginationState(newPagination);
  }, []);

  const clearError = useCallback(() => {
    // React Query handles error state automatically
  }, []);

  return {
    users: processedUsers,
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