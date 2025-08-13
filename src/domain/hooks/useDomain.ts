import { useState, useEffect, useCallback } from 'react'
import { DomainAPI } from '../../services/domain-api'
import { DomainInfo, TrustRelationship, BackupInfo } from '../../types/samba'
import { APIError } from '../../lib/errors'

export interface UseDomainInfoReturn {
  domainInfo: DomainInfo | null;
  loading: boolean;
  error: string | null;
  fetchDomainInfo: (ipAddress?: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for fetching domain information
 */
export const useDomainInfo = (): UseDomainInfoReturn => {
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDomainInfo = useCallback(async (ipAddress?: string) => {
    try {
      setLoading(true)
      setError(null)

      const info = await DomainAPI.getInfo(ipAddress)
      setDomainInfo(info)
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message)
      } else {
        setError('Failed to load domain information')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchDomainInfo()
  }, [fetchDomainInfo])

  // Don't auto-fetch on mount since domain info requires user input in many cases

  return {
    domainInfo,
    loading,
    error,
    fetchDomainInfo,
    refresh
  }
}

export interface UseTrustsReturn {
  trusts: TrustRelationship[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for fetching trust relationships
 */
export const useTrusts = (): UseTrustsReturn => {
  const [trusts, setTrusts] = useState<TrustRelationship[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrusts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const trustsData = await DomainAPI.listTrusts()
      setTrusts(trustsData)
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message)
      } else {
        setError('Failed to load trust relationships')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchTrusts()
  }, [fetchTrusts])

  useEffect(() => {
    fetchTrusts()
  }, [fetchTrusts])

  return {
    trusts,
    loading,
    error,
    refresh
  }
}

export interface UseTrustDetailsReturn {
  trust: TrustRelationship | null;
  namespaces: string[];
  validation: { valid: boolean; message: string } | null;
  loading: boolean;
  error: string | null;
  fetchTrustDetails: (domain: string) => Promise<void>;
  validateTrust: (domain: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for fetching detailed trust information
 */
export const useTrustDetails = (): UseTrustDetailsReturn => {
  const [trust, setTrust] = useState<TrustRelationship | null>(null)
  const [namespaces, setNamespaces] = useState<string[]>([])
  const [validation, setValidation] = useState<{ valid: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTrustDetails = useCallback(async (domain: string) => {
    try {
      setLoading(true)
      setError(null)

      const [trustData, namespacesData] = await Promise.all([
        DomainAPI.showTrust(domain),
        DomainAPI.listNamespaces(domain)
      ])

      setTrust(trustData)
      setNamespaces(namespacesData)
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message)
      } else {
        setError('Failed to load trust details')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const validateTrust = useCallback(async (domain: string) => {
    try {
      setLoading(true)
      setError(null)

      const validationResult = await DomainAPI.validateTrust(domain)
      setValidation(validationResult)
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message)
      } else {
        setError('Failed to validate trust')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    if (trust) {
      await fetchTrustDetails(trust.name)
    }
  }, [fetchTrustDetails, trust])

  return {
    trust,
    namespaces,
    validation,
    loading,
    error,
    fetchTrustDetails,
    validateTrust,
    refresh
  }
}

export interface UseBackupHistoryReturn {
  backups: BackupInfo[];
  loading: boolean;
  error: string | null;
  addBackup: (backup: BackupInfo) => void;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for managing backup history
 * Note: Samba-tool doesn't provide a list of past backups, so this maintains local state
 */
export const useBackupHistory = (): UseBackupHistoryReturn => {
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const addBackup = useCallback((backup: BackupInfo) => {
    setBackups(prev => [backup, ...prev])
  }, [])

  const refresh = useCallback(async () => {
    // Since samba-tool doesn't provide backup listing, we just maintain local state
    // In a real implementation, you might scan backup directories or maintain a database
    setLoading(false)
  }, [])

  // Load backup history from localStorage on mount
  useEffect(() => {
    const savedBackups = localStorage.getItem('samba-backup-history')
    if (savedBackups) {
      try {
        const parsedBackups = JSON.parse(savedBackups)
        setBackups(parsedBackups.map((backup: any) => ({
          ...backup,
          timestamp: new Date(backup.timestamp)
        })))
      } catch (err) {
        console.warn('Failed to load backup history from localStorage:', err)
      }
    }
  }, [])

  // Save backup history to localStorage whenever it changes
  useEffect(() => {
    if (backups.length > 0) {
      localStorage.setItem('samba-backup-history', JSON.stringify(backups))
    }
  }, [backups])

  return {
    backups,
    loading,
    error,
    addBackup,
    refresh
  }
}
