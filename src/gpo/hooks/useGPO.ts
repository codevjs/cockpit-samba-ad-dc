import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { GPOAPI } from '@/services/gpo-api'
import type {
  SambaGPO,
  CreateGPOInput,
  UpdateGPOInput,
  DeleteGPOInput,
  BackupGPOInput,
  RestoreGPOInput,
  FetchGPOInput,
  GPOLink,
  SetGPOLinkInput,
  DeleteGPOLinkInput,
  GPOInheritance,
  SetGPOInheritanceInput,
  GPOContainer
} from '@/types/samba'

export interface UseGPOsReturn {
  gpos: SambaGPO[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useGPOs = (autoFetch: boolean = true): UseGPOsReturn => {
  const {
    data: gpos = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['gpos'],
    queryFn: () => GPOAPI.listGPOs(),
    enabled: autoFetch,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    gpos,
    loading,
    error,
    refresh
  }
}

export interface UseGPODetailsReturn {
  gpo: SambaGPO | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useGPODetails = (gpoName: string | null, autoFetch: boolean = true): UseGPODetailsReturn => {
  const {
    data: gpo = null,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['gpo-details', gpoName],
    queryFn: () => gpoName ? GPOAPI.showGPO(gpoName) : null,
    enabled: autoFetch && !!gpoName,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    gpo,
    loading,
    error,
    refresh
  }
}

export interface UseGPOLinksReturn {
  links: GPOLink[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useGPOLinks = (containerDN: string | null, autoFetch: boolean = true): UseGPOLinksReturn => {
  const {
    data: links = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['gpo-links', containerDN],
    queryFn: () => containerDN ? GPOAPI.getGPOLinks(containerDN) : [],
    enabled: autoFetch && !!containerDN,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    links,
    loading,
    error,
    refresh
  }
}

export interface UseGPOInheritanceReturn {
  inheritance: GPOInheritance | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useGPOInheritance = (containerDN: string | null, autoFetch: boolean = true): UseGPOInheritanceReturn => {
  const {
    data: inheritance = null,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['gpo-inheritance', containerDN],
    queryFn: () => containerDN ? GPOAPI.getGPOInheritance(containerDN) : null,
    enabled: autoFetch && !!containerDN,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    inheritance,
    loading,
    error,
    refresh
  }
}

export interface UseGPOContainersReturn {
  containers: GPOContainer[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useGPOContainers = (autoFetch: boolean = true): UseGPOContainersReturn => {
  const {
    data: containers = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['gpo-containers'],
    queryFn: () => GPOAPI.listContainers(),
    enabled: autoFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    containers,
    loading,
    error,
    refresh
  }
}

export interface UseGPOMutationsReturn {
  createGPO: (input: CreateGPOInput) => Promise<void>;
  updateGPO: (input: UpdateGPOInput) => Promise<void>;
  deleteGPO: (input: DeleteGPOInput) => Promise<void>;
  backupGPO: (input: BackupGPOInput) => Promise<void>;
  restoreGPO: (input: RestoreGPOInput) => Promise<void>;
  fetchGPO: (input: FetchGPOInput) => Promise<void>;
  setGPOLink: (input: SetGPOLinkInput) => Promise<void>;
  deleteGPOLink: (input: DeleteGPOLinkInput) => Promise<void>;
  setGPOInheritance: (input: SetGPOInheritanceInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for GPO mutation operations
 */
export const useGPOMutations = (onSuccess?: () => void, onError?: (error: string) => void): UseGPOMutationsReturn => {
  const queryClient = useQueryClient()

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['gpos'] })
    queryClient.invalidateQueries({ queryKey: ['gpo-details'] })
    queryClient.invalidateQueries({ queryKey: ['gpo-links'] })
    queryClient.invalidateQueries({ queryKey: ['gpo-inheritance'] })
    queryClient.invalidateQueries({ queryKey: ['gpo-containers'] })
  }, [queryClient])

  const createGPO = useCallback(async (input: CreateGPOInput) => {
    try {
      await GPOAPI.createGPO(input)
      invalidateQueries()
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create GPO'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError, invalidateQueries])

  const updateGPO = useCallback(async (_input: UpdateGPOInput) => {
    try {
      // Note: Samba doesn't have direct update, this would need custom implementation
      // For now, we'll just invalidate queries
      invalidateQueries()
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update GPO'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError, invalidateQueries])

  const deleteGPO = useCallback(async (input: DeleteGPOInput) => {
    try {
      await GPOAPI.deleteGPO(input)
      invalidateQueries()
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete GPO'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError, invalidateQueries])

  const backupGPO = useCallback(async (input: BackupGPOInput) => {
    try {
      await GPOAPI.backupGPO(input)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to backup GPO'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const restoreGPO = useCallback(async (input: RestoreGPOInput) => {
    try {
      await GPOAPI.restoreGPO(input)
      invalidateQueries()
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore GPO'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError, invalidateQueries])

  const fetchGPO = useCallback(async (input: FetchGPOInput) => {
    try {
      await GPOAPI.fetchGPO(input)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch GPO'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const setGPOLink = useCallback(async (input: SetGPOLinkInput) => {
    try {
      await GPOAPI.setGPOLink(input)
      invalidateQueries()
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set GPO link'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError, invalidateQueries])

  const deleteGPOLink = useCallback(async (input: DeleteGPOLinkInput) => {
    try {
      await GPOAPI.deleteGPOLink(input)
      invalidateQueries()
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete GPO link'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError, invalidateQueries])

  const setGPOInheritance = useCallback(async (input: SetGPOInheritanceInput) => {
    try {
      await GPOAPI.setGPOInheritance(input)
      invalidateQueries()
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set GPO inheritance'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError, invalidateQueries])

  return {
    createGPO,
    updateGPO,
    deleteGPO,
    backupGPO,
    restoreGPO,
    fetchGPO,
    setGPOLink,
    deleteGPOLink,
    setGPOInheritance,
    isLoading: false, // We handle loading states at the component level
    error: null // We handle errors via the callbacks
  }
}
