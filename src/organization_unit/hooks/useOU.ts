import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { OrganizationUnitAPI } from '@/services/ou-api'
import type {
  SambaOU,
  SambaOUObject,
  CreateOUInput,
  MoveOUInput,
  RenameOUInput
} from '@/types/samba'

export interface UseOUReturn {
  ous: SambaOU[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useOUs = (autoFetch: boolean = true): UseOUReturn => {
  const {
    data: ous = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['organizational-units'],
    queryFn: () => OrganizationUnitAPI.listOUs(),
    enabled: autoFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    ous,
    loading,
    error,
    refresh
  }
}

export interface UseOUDetailReturn {
  ou: SambaOU | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useOUDetail = (ouDN: string | null, autoFetch: boolean = true): UseOUDetailReturn => {
  const {
    data: ou = null,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['organizational-unit', ouDN],
    queryFn: () => ouDN ? OrganizationUnitAPI.getOU(ouDN) : null,
    enabled: autoFetch && !!ouDN,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    ou,
    loading,
    error,
    refresh
  }
}

export interface UseOUObjectsReturn {
  objects: SambaOUObject[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useOUObjects = (ouDN: string | null, autoFetch: boolean = true): UseOUObjectsReturn => {
  const {
    data: objects = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['ou-objects', ouDN],
    queryFn: () => ouDN ? OrganizationUnitAPI.listOUObjects(ouDN) : [],
    enabled: autoFetch && !!ouDN,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    objects,
    loading,
    error,
    refresh
  }
}

export interface UseOUMutationsReturn {
  createOU: (ouData: CreateOUInput) => Promise<void>;
  deleteOU: (ouDN: string) => Promise<void>;
  moveOU: (moveData: MoveOUInput) => Promise<void>;
  renameOU: (renameData: RenameOUInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for OU mutation operations
 */
export const useOUMutations = (onSuccess?: () => void, onError?: (error: string) => void): UseOUMutationsReturn => {
  const createOU = useCallback(async (ouData: CreateOUInput) => {
    try {
      await OrganizationUnitAPI.createOU(ouData)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create organizational unit'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const deleteOU = useCallback(async (ouDN: string) => {
    try {
      await OrganizationUnitAPI.deleteOU(ouDN)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete organizational unit'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const moveOU = useCallback(async (moveData: MoveOUInput) => {
    try {
      await OrganizationUnitAPI.moveOU(moveData)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move organizational unit'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const renameOU = useCallback(async (renameData: RenameOUInput) => {
    try {
      await OrganizationUnitAPI.renameOU(renameData)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rename organizational unit'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  return {
    createOU,
    deleteOU,
    moveOU,
    renameOU,
    isLoading: false, // We handle loading states at the component level
    error: null // We handle errors via the callbacks
  }
}
