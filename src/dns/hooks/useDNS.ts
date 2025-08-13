import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DNSAPI } from '@/services/dns-api';
import type { 
  DNSZoneInfo,
  DNSServerInfo,
  CreateDNSRecordInput,
  DeleteDNSRecordInput,
  CreateDNSZoneInput,
  DeleteDNSZoneInput,
  DNSCleanupInput
} from '@/types/samba';

export interface UseDNSZonesReturn {
  zones: string[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useDNSZones = (server: string | null, password?: string, autoFetch: boolean = true): UseDNSZonesReturn => {
  const { 
    data: zones = [], 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['dns-zones', server],
    queryFn: () => server ? DNSAPI.listZones(server, password) : [],
    enabled: autoFetch && !!server,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const error = queryError ? (queryError as Error).message : null;

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    zones,
    loading,
    error,
    refresh,
  };
};

export interface UseDNSZoneInfoReturn {
  zoneInfo: DNSZoneInfo | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useDNSZoneInfo = (server: string | null, zoneName: string | null, password?: string, autoFetch: boolean = true): UseDNSZoneInfoReturn => {
  const { 
    data: zoneInfo = null, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['dns-zone-info', server, zoneName],
    queryFn: () => server && zoneName ? DNSAPI.getZoneInfo(server, zoneName, password) : null,
    enabled: autoFetch && !!server && !!zoneName,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const error = queryError ? (queryError as Error).message : null;

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    zoneInfo,
    loading,
    error,
    refresh,
  };
};

export interface UseDNSServerInfoReturn {
  serverInfo: DNSServerInfo | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useDNSServerInfo = (server: string | null, password?: string, autoFetch: boolean = true): UseDNSServerInfoReturn => {
  const { 
    data: serverInfo = null, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['dns-server-info', server],
    queryFn: () => server ? DNSAPI.getServerInfo(server, password) : null,
    enabled: autoFetch && !!server,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const error = queryError ? (queryError as Error).message : null;

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    serverInfo,
    loading,
    error,
    refresh,
  };
};

export interface UseDNSMutationsReturn {
  createRecord: (input: CreateDNSRecordInput) => Promise<void>;
  deleteRecord: (input: DeleteDNSRecordInput) => Promise<void>;
  createZone: (input: CreateDNSZoneInput) => Promise<void>;
  deleteZone: (input: DeleteDNSZoneInput) => Promise<void>;
  cleanup: (input: DNSCleanupInput) => Promise<string[]>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for DNS mutation operations
 */
export const useDNSMutations = (onSuccess?: () => void, onError?: (error: string) => void): UseDNSMutationsReturn => {
  const createRecord = useCallback(async (input: CreateDNSRecordInput) => {
    try {
      await DNSAPI.createRecord(input);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create DNS record';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  const deleteRecord = useCallback(async (input: DeleteDNSRecordInput) => {
    try {
      await DNSAPI.deleteRecord(input);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete DNS record';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  const createZone = useCallback(async (input: CreateDNSZoneInput) => {
    try {
      await DNSAPI.createZone(input);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create DNS zone';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  const deleteZone = useCallback(async (input: DeleteDNSZoneInput) => {
    try {
      await DNSAPI.deleteZone(input);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete DNS zone';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  const cleanup = useCallback(async (input: DNSCleanupInput) => {
    try {
      const result = await DNSAPI.cleanup(input);
      onSuccess?.();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cleanup DNS';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  return {
    createRecord,
    deleteRecord,
    createZone,
    deleteZone,
    cleanup,
    isLoading: false, // We handle loading states at the component level
    error: null // We handle errors via the callbacks
  };
};