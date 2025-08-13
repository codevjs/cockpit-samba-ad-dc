import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DelegationAPI } from '@/services/delegation-api';
import type { 
  DelegationInfo, 
  AddServiceDelegationInput, 
  DeleteServiceDelegationInput, 
  SetAnyServiceInput, 
  SetAnyProtocolInput 
} from '@/types/samba';

export interface UseDelegationReturn {
  delegation: DelegationInfo | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useDelegation = (accountName: string | null, autoFetch: boolean = true): UseDelegationReturn => {
  const { 
    data: delegation = null, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['delegation', accountName],
    queryFn: () => accountName ? DelegationAPI.showDelegation(accountName) : null,
    enabled: autoFetch && !!accountName,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const error = queryError ? (queryError as Error).message : null;

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    delegation,
    loading,
    error,
    refresh,
  };
};

export interface UseDelegationMutationsReturn {
  addService: (input: AddServiceDelegationInput) => Promise<void>;
  deleteService: (input: DeleteServiceDelegationInput) => Promise<void>;
  setAnyService: (input: SetAnyServiceInput) => Promise<void>;
  setAnyProtocol: (input: SetAnyProtocolInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for delegation mutation operations
 */
export const useDelegationMutations = (onSuccess?: () => void, onError?: (error: string) => void): UseDelegationMutationsReturn => {
  const addService = useCallback(async (input: AddServiceDelegationInput) => {
    try {
      await DelegationAPI.addService(input);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add service delegation';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  const deleteService = useCallback(async (input: DeleteServiceDelegationInput) => {
    try {
      await DelegationAPI.deleteService(input);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete service delegation';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  const setAnyService = useCallback(async (input: SetAnyServiceInput) => {
    try {
      await DelegationAPI.setAnyService(input);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set any-service delegation';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  const setAnyProtocol = useCallback(async (input: SetAnyProtocolInput) => {
    try {
      await DelegationAPI.setAnyProtocol(input);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set any-protocol delegation';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  return {
    addService,
    deleteService,
    setAnyService,
    setAnyProtocol,
    isLoading: false, // We handle loading states at the component level
    error: null // We handle errors via the callbacks
  };
};