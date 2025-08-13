import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ForestAPI } from '@/services/forest-api'
import type {
  SambaForest,
  ForestDirectoryServiceInfo,
  SetDSHeuristicsInput
} from '@/types/samba'

export interface UseForestReturn {
  forest: SambaForest | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useForest = (autoFetch: boolean = true): UseForestReturn => {
  const {
    data: forest = null,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['forest'],
    queryFn: () => ForestAPI.getForestInfo(),
    enabled: autoFetch,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    forest,
    loading,
    error,
    refresh
  }
}

export interface UseDirectoryServiceReturn {
  settings: ForestDirectoryServiceInfo[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useDirectoryService = (autoFetch: boolean = true): UseDirectoryServiceReturn => {
  const {
    data: settings = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['directory-service-settings'],
    queryFn: () => ForestAPI.getDirectoryServiceSettings(),
    enabled: autoFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    settings,
    loading,
    error,
    refresh
  }
}

export interface UseForestMutationsReturn {
  setDSHeuristics: (heuristicsData: SetDSHeuristicsInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for forest mutation operations
 */
export const useForestMutations = (onSuccess?: () => void, onError?: (error: string) => void): UseForestMutationsReturn => {
  const setDSHeuristics = useCallback(async (heuristicsData: SetDSHeuristicsInput) => {
    try {
      await ForestAPI.setDSHeuristics(heuristicsData)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set dsheuristics'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  return {
    setDSHeuristics,
    isLoading: false, // We handle loading states at the component level
    error: null // We handle errors via the callbacks
  }
}
