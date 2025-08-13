import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SitesAPI } from '@/services/sites-api'
import type {
  SambaSite,
  SambaSubnet,
  CreateSiteInput,
  CreateSubnetInput,
  SetSiteInput
} from '@/types/samba'

export interface UseSitesReturn {
  sites: SambaSite[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useSites = (autoFetch: boolean = true): UseSitesReturn => {
  const {
    data: sites = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['sites'],
    queryFn: () => SitesAPI.listSites(),
    enabled: autoFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    sites,
    loading,
    error,
    refresh
  }
}

export interface UseSubnetsReturn {
  subnets: SambaSubnet[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useSubnets = (autoFetch: boolean = true): UseSubnetsReturn => {
  const {
    data: subnets = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['subnets'],
    queryFn: () => SitesAPI.listSubnets(),
    enabled: autoFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    subnets,
    loading,
    error,
    refresh
  }
}

export interface UseSitesMutationsReturn {
  createSite: (siteData: CreateSiteInput) => Promise<void>;
  removeSite: (siteName: string) => Promise<void>;
  createSubnet: (subnetData: CreateSubnetInput) => Promise<void>;
  removeSubnet: (subnetName: string) => Promise<void>;
  setSite: (setSiteData: SetSiteInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for sites mutation operations
 */
export const useSitesMutations = (onSuccess?: () => void, onError?: (error: string) => void): UseSitesMutationsReturn => {
  const createSite = useCallback(async (siteData: CreateSiteInput) => {
    try {
      await SitesAPI.createSite(siteData)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create site'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const removeSite = useCallback(async (siteName: string) => {
    try {
      await SitesAPI.removeSite(siteName)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove site'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const createSubnet = useCallback(async (subnetData: CreateSubnetInput) => {
    try {
      await SitesAPI.createSubnet(subnetData)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subnet'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const removeSubnet = useCallback(async (subnetName: string) => {
    try {
      await SitesAPI.removeSubnet(subnetName)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove subnet'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const setSite = useCallback(async (setSiteData: SetSiteInput) => {
    try {
      await SitesAPI.setSite(setSiteData)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set site for server'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  return {
    createSite,
    removeSite,
    createSubnet,
    removeSubnet,
    setSite,
    isLoading: false, // We handle loading states at the component level
    error: null // We handle errors via the callbacks
  }
}
