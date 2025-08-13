import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DSACLApi } from '@/services/dsacl-api';
import type { DSACLInfo, SetDSACLInput } from '@/types/samba';

export interface UseDSACLReturn {
  dsacl: DSACLInfo | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useDSACL = (objectDN?: string, autoFetch: boolean = true): UseDSACLReturn => {
  const { 
    data: dsacl = null, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['dsacl', objectDN],
    queryFn: () => DSACLApi.getDSACL(objectDN),
    enabled: autoFetch,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const error = queryError ? (queryError as Error).message : null;

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    dsacl,
    loading,
    error,
    refresh,
  };
};

export interface UseDSACLMutationsReturn {
  setDSACL: (aclData: SetDSACLInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for DSACL mutation operations
 */
export const useDSACLMutations = (onSuccess?: () => void, onError?: (error: string) => void): UseDSACLMutationsReturn => {
  const setDSACL = useCallback(async (aclData: SetDSACLInput) => {
    try {
      await DSACLApi.setDSACL(aclData);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set DSACL';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  return {
    setDSACL,
    isLoading: false, // We handle loading states at the component level
    error: null // We handle errors via the callbacks
  };
};