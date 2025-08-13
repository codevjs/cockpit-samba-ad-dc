import { useCallback } from 'react'
import { DomainAPI } from '../../services/domain-api'
import {
  DomainJoinInput,
  CreateTrustInput,
  BackupOfflineInput,
  BackupOnlineInput,
  BackupRenameInput,
  BackupRestoreInput
} from '../../types/samba'
import { APIError } from '../../lib/errors'

export interface UseDomainMutationsReturn {
  joinDomain: (joinData: DomainJoinInput) => Promise<string>;
  demoteDomain: (username?: string, password?: string) => Promise<string>;
  promoteDomain: (domain: string, adminPassword: string) => Promise<string>;
  classicUpgrade: (ntdbPath: string) => Promise<string>;
  createTrust: (trustData: CreateTrustInput) => Promise<void>;
  deleteTrust: (domain: string, username?: string, password?: string) => Promise<void>;
  validateTrust: (domain: string) => Promise<{ valid: boolean; message: string }>;
  backupOffline: (backupData: BackupOfflineInput) => Promise<void>;
  backupOnline: (backupData: BackupOnlineInput) => Promise<void>;
  backupRename: (renameData: BackupRenameInput) => Promise<string>;
  backupRestore: (restoreData: BackupRestoreInput) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for domain mutation operations
 */
export const useDomainMutations = (
  onSuccess?: (message?: string) => void,
  onError?: (error: string) => void
): UseDomainMutationsReturn => {
  const joinDomain = useCallback(async (joinData: DomainJoinInput): Promise<string> => {
    try {
      const result = await DomainAPI.join(joinData)
      onSuccess?.('Domain joined successfully')
      return result
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to join domain'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const demoteDomain = useCallback(async (username?: string, password?: string): Promise<string> => {
    try {
      const result = await DomainAPI.demote(username, password)
      onSuccess?.('Domain controller demoted successfully')
      return result
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to demote domain controller'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const promoteDomain = useCallback(async (domain: string, adminPassword: string): Promise<string> => {
    try {
      const result = await DomainAPI.promote(domain, adminPassword)
      onSuccess?.('Domain controller promoted successfully')
      return result
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to promote to domain controller'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const classicUpgrade = useCallback(async (ntdbPath: string): Promise<string> => {
    try {
      const result = await DomainAPI.classicUpgrade(ntdbPath)
      onSuccess?.('Classic upgrade completed successfully')
      return result
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to perform classic upgrade'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const createTrust = useCallback(async (trustData: CreateTrustInput): Promise<void> => {
    try {
      await DomainAPI.createTrust(trustData)
      onSuccess?.('Trust relationship created successfully')
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to create trust relationship'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const deleteTrust = useCallback(async (domain: string, username?: string, password?: string): Promise<void> => {
    try {
      await DomainAPI.deleteTrust(domain, username, password)
      onSuccess?.('Trust relationship deleted successfully')
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to delete trust relationship'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const validateTrust = useCallback(async (domain: string): Promise<{ valid: boolean; message: string }> => {
    try {
      const result = await DomainAPI.validateTrust(domain)
      if (result.valid) {
        onSuccess?.('Trust relationship is valid')
      } else {
        onError?.(`Trust validation failed: ${result.message}`)
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to validate trust relationship'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const backupOffline = useCallback(async (backupData: BackupOfflineInput): Promise<void> => {
    try {
      const result = await DomainAPI.backupOffline(backupData)
      onSuccess?.(`Offline backup completed: ${result.path}`)
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to create offline backup'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const backupOnline = useCallback(async (backupData: BackupOnlineInput): Promise<void> => {
    try {
      const result = await DomainAPI.backupOnline(backupData)
      onSuccess?.(`Online backup completed: ${result.path}`)
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to create online backup'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const backupRename = useCallback(async (renameData: BackupRenameInput): Promise<string> => {
    try {
      const result = await DomainAPI.backupRename(renameData)
      onSuccess?.('Backup renamed successfully')
      return result
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to rename backup'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const backupRestore = useCallback(async (restoreData: BackupRestoreInput): Promise<string> => {
    try {
      const result = await DomainAPI.backupRestore(restoreData)
      onSuccess?.('Backup restored successfully')
      return result
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to restore backup'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  return {
    joinDomain,
    demoteDomain,
    promoteDomain,
    classicUpgrade,
    createTrust,
    deleteTrust,
    validateTrust,
    backupOffline,
    backupOnline,
    backupRename,
    backupRestore,
    isLoading: false, // We handle loading states at the component level
    error: null // We handle errors via the callbacks
  }
}
