// Computer Data Hook for Fetching and Management

import { useState, useEffect, useCallback } from 'react';
import { ComputerAPI } from '@/services/computer-api';
import { ErrorHandler } from '@/lib/errors';
import type { SambaComputer, FilterOptions } from '@/types/samba';

export interface UseComputersOptions {
  initialFilters?: FilterOptions;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseComputersReturn {
  // Data
  computers: SambaComputer[];
  filteredComputers: SambaComputer[];
  
  // States
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Filters
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  updateFilters: (partialFilters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  
  // Actions
  refreshComputers: () => Promise<void>;
  getComputer: (computerName: string) => SambaComputer | undefined;
  
  // Statistics
  stats: {
    total: number;
    enabled: number;
    disabled: number;
    byOS: Record<string, number>;
  };
}

export const useComputers = (options: UseComputersOptions = {}): UseComputersReturn => {
  const {
    initialFilters = {},
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  // State
  const [computers, setComputers] = useState<SambaComputer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch computers
  const fetchComputers = useCallback(async (appliedFilters?: FilterOptions) => {
    try {
      setLoading(true);
      clearError();
      
      const currentFilters = appliedFilters || filters;
      const fetchedComputers = await ComputerAPI.list(currentFilters);
      
      setComputers(fetchedComputers);
      setLastUpdated(new Date());
      
      return fetchedComputers;
    } catch (err) {
      const apiError = ErrorHandler.handle(err, 'useComputers.fetchComputers', {
        showToast: true,
        rethrow: false,
      });
      setError(apiError.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters, clearError]);

  // Public refresh function
  const refreshComputers = useCallback(async () => {
    await fetchComputers();
  }, [fetchComputers]);

  // Filter management
  const updateFilters = useCallback((partialFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...partialFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Get specific computer
  const getComputer = useCallback((computerName: string): SambaComputer | undefined => {
    return computers.find(computer => computer.name.toLowerCase() === computerName.toLowerCase());
  }, [computers]);

  // Apply client-side filtering for performance
  const filteredComputers = computers.filter(computer => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        computer.name.toLowerCase().includes(searchTerm) ||
        computer.dnsHostName?.toLowerCase().includes(searchTerm) ||
        computer.operatingSystem?.toLowerCase().includes(searchTerm) ||
        computer.description?.toLowerCase().includes(searchTerm);
      
      if (!matchesSearch) return false;
    }

    // Enabled filter
    if (filters.enabled !== undefined && computer.enabled !== filters.enabled) {
      return false;
    }

    // Organizational Unit filter
    if (filters.organizationalUnit && computer.organizationalUnit !== filters.organizationalUnit) {
      return false;
    }

    return true;
  });

  // Statistics
  const stats = {
    total: computers.length,
    enabled: computers.filter(computer => computer.enabled).length,
    disabled: computers.filter(computer => !computer.enabled).length,
    byOS: computers.reduce((acc, computer) => {
      const os = computer.operatingSystem || 'Unknown';
      acc[os] = (acc[os] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  // Initial load and filter changes
  useEffect(() => {
    fetchComputers();
  }, [fetchComputers]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchComputers();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, fetchComputers]);

  return {
    // Data
    computers,
    filteredComputers,
    
    // States
    loading,
    error,
    lastUpdated,
    
    // Filters
    filters,
    setFilters,
    updateFilters,
    clearFilters,
    
    // Actions
    refreshComputers,
    getComputer,
    
    // Statistics
    stats,
  };
};