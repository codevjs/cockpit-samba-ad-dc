import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { NTACLApi } from '@/services/ntacl-api'
import type {
  NTACLInfo,
  DOSInfo,
  GetNTACLInput,
  SetNTACLInput,
  ChangeDomSIDInput,
  SysvolOperationInput
} from '@/types/samba'

export interface UseNTACLReturn {
  ntacl: NTACLInfo | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useNTACL = (input: GetNTACLInput | null, autoFetch: boolean = true): UseNTACLReturn => {
  const {
    data: ntacl = null,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['ntacl', input?.file],
    queryFn: () => input ? NTACLApi.getNTACL(input) : null,
    enabled: autoFetch && !!input,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    ntacl,
    loading,
    error,
    refresh
  }
}

export interface UseDOSInfoReturn {
  dosInfo: DOSInfo | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useDOSInfo = (input: GetNTACLInput | null, autoFetch: boolean = true): UseDOSInfoReturn => {
  const {
    data: dosInfo = null,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['dos-info', input?.file],
    queryFn: () => input ? NTACLApi.getDOSInfo(input) : null,
    enabled: autoFetch && !!input,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    dosInfo,
    loading,
    error,
    refresh
  }
}

export interface UseSysvolCheckReturn {
  sysvolStatus: string[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useSysvolCheck = (input: SysvolOperationInput = {}, autoFetch: boolean = true): UseSysvolCheckReturn => {
  const {
    data: sysvolStatus = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['sysvol-check', input],
    queryFn: () => NTACLApi.sysvolCheck(input),
    enabled: autoFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    sysvolStatus,
    loading,
    error,
    refresh
  }
}

export interface UseNTACLMutationsReturn {
  setNTACL: (input: SetNTACLInput) => Promise<void>;
  changeDomainSID: (input: ChangeDomSIDInput) => Promise<void>;
  sysvolReset: (input?: SysvolOperationInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for NT ACL mutation operations
 */
export const useNTACLMutations = (onSuccess?: () => void, onError?: (error: string) => void): UseNTACLMutationsReturn => {
  const setNTACL = useCallback(async (input: SetNTACLInput) => {
    try {
      await NTACLApi.setNTACL(input)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set NT ACL'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const changeDomainSID = useCallback(async (input: ChangeDomSIDInput) => {
    try {
      await NTACLApi.changeDomainSID(input)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change domain SID'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const sysvolReset = useCallback(async (input: SysvolOperationInput = {}) => {
    try {
      await NTACLApi.sysvolReset(input)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset SYSVOL'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  return {
    setNTACL,
    changeDomainSID,
    sysvolReset,
    isLoading: false, // We handle loading states at the component level
    error: null // We handle errors via the callbacks
  }
}
