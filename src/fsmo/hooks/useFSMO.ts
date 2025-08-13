import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FSMOAPI } from '@/services/fsmo-api';
import { ErrorHandler } from '@/lib/errors';
import type { FSMORoles, TransferFSMORoleInput, SeizeFSMORoleInput } from '@/types/samba';

export interface UseFSMOReturn {
  roles: FSMORoles | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useFSMO = (autoFetch: boolean = true): UseFSMOReturn => {
  const { 
    data: roles = null, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['fsmo-roles'],
    queryFn: () => FSMOAPI.showRoles(),
    enabled: autoFetch,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const error = queryError ? (queryError as Error).message : null;

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const clearError = useCallback(() => {
    // React Query handles error state automatically
  }, []);

  return {
    roles,
    loading,
    error,
    refresh,
    clearError,
  };
};

export interface UseFSMOMutationsReturn {
  transferRole: (transferData: TransferFSMORoleInput) => Promise<void>;
  seizeRole: (seizeData: SeizeFSMORoleInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for FSMO mutation operations (transfer, seize)
 */
export const useFSMOMutations = (onSuccess?: () => void, onError?: (error: string) => void): UseFSMOMutationsReturn => {
  const transferRole = useCallback(async (transferData: TransferFSMORoleInput) => {
    try {
      await FSMOAPI.transferRole(transferData);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transfer FSMO role';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  const seizeRole = useCallback(async (seizeData: SeizeFSMORoleInput) => {
    try {
      await FSMOAPI.seizeRole(seizeData);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to seize FSMO role';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  return {
    transferRole,
    seizeRole,
    isLoading: false, // We handle loading states at the component level
    error: null // We handle errors via the callbacks
  };
};