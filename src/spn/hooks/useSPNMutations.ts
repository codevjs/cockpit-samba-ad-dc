import { useCallback } from 'react';
import { SPNAPI } from '../../services/spn-api';
import { CreateSPNInput, DeleteSPNInput } from '../../types/samba';
import { APIError } from '../../lib/errors';

export interface UseSPNMutationsReturn {
  addSPN: (spnData: CreateSPNInput) => Promise<void>;
  deleteSPN: (spnData: DeleteSPNInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for SPN mutation operations (add, delete)
 */
export const useSPNMutations = (onSuccess?: () => void, onError?: (error: string) => void): UseSPNMutationsReturn => {
  const addSPN = useCallback(async (spnData: CreateSPNInput) => {
    try {
      await SPNAPI.add(spnData);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to add SPN';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  const deleteSPN = useCallback(async (spnData: DeleteSPNInput) => {
    try {
      await SPNAPI.delete(spnData);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to delete SPN';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  return {
    addSPN,
    deleteSPN,
    isLoading: false, // We handle loading states at the component level
    error: null // We handle errors via the callbacks
  };
};