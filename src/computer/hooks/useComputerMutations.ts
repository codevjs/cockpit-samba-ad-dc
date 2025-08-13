// Computer Mutation Hooks for CRUD Operations

import { useState, useCallback } from 'react'
import { ComputerAPI } from '@/services/computer-api'
import { ErrorHandler } from '@/lib/errors'
import type {
  SambaComputer,
  CreateComputerInput
} from '@/types/samba'

export interface MutationState {
  loading: boolean;
  error: string | null;
}

export interface UseComputerMutationsOptions {
  onSuccess?: (action: string, data?: any) => void;
  onError?: (action: string, error: string) => void;
  autoRefresh?: () => Promise<void>;
}

export interface UseComputerMutationsReturn {
  // States
  creating: boolean;
  deleting: boolean;
  enablingDisabling: boolean;
  moving: boolean;
  error: string | null;

  // Actions
  create: (computerData: CreateComputerInput) => Promise<SambaComputer | null>;
  delete: (computerName: string) => Promise<boolean>;
  enable: (computerName: string) => Promise<SambaComputer | null>;
  disable: (computerName: string) => Promise<SambaComputer | null>;
  move: (computerName: string, targetOU: string) => Promise<SambaComputer | null>;

  // Utilities
  clearError: () => void;
  isLoading: boolean;
}

export const useComputerMutations = (options: UseComputerMutationsOptions = {}): UseComputerMutationsReturn => {
  const { onSuccess, onError, autoRefresh } = options

  // Individual loading states
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [enablingDisabling, setEnablingDisabling] = useState(false)
  const [moving, setMoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((action: string, err: unknown) => {
    const apiError = ErrorHandler.handle(err, `useComputerMutations.${action}`, {
      showToast: false,
      rethrow: false
    })
    setError(apiError.message)
    onError?.(action, apiError.message)
    return null
  }, [onError])

  const create = useCallback(async (computerData: CreateComputerInput): Promise<SambaComputer | null> => {
    try {
      setCreating(true)
      clearError()

      const newComputer = await ComputerAPI.create(computerData)

      onSuccess?.('create', newComputer)
      if (autoRefresh) await autoRefresh()

      return newComputer
    } catch (err) {
      return handleError('create', err)
    } finally {
      setCreating(false)
    }
  }, [onSuccess, autoRefresh, handleError, clearError])

  const deleteComputer = useCallback(async (computerName: string): Promise<boolean> => {
    try {
      setDeleting(true)
      clearError()

      await ComputerAPI.delete(computerName)

      onSuccess?.('delete', { computerName })
      if (autoRefresh) await autoRefresh()

      return true
    } catch (err) {
      handleError('delete', err)
      return false
    } finally {
      setDeleting(false)
    }
  }, [onSuccess, autoRefresh, handleError, clearError])

  const enable = useCallback(async (computerName: string): Promise<SambaComputer | null> => {
    try {
      setEnablingDisabling(true)
      clearError()

      const computer = await ComputerAPI.enable(computerName)

      onSuccess?.('enable', computer)
      if (autoRefresh) await autoRefresh()

      return computer
    } catch (err) {
      return handleError('enable', err)
    } finally {
      setEnablingDisabling(false)
    }
  }, [onSuccess, autoRefresh, handleError, clearError])

  const disable = useCallback(async (computerName: string): Promise<SambaComputer | null> => {
    try {
      setEnablingDisabling(true)
      clearError()

      const computer = await ComputerAPI.disable(computerName)

      onSuccess?.('disable', computer)
      if (autoRefresh) await autoRefresh()

      return computer
    } catch (err) {
      return handleError('disable', err)
    } finally {
      setEnablingDisabling(false)
    }
  }, [onSuccess, autoRefresh, handleError, clearError])

  const move = useCallback(async (computerName: string, targetOU: string): Promise<SambaComputer | null> => {
    try {
      setMoving(true)
      clearError()

      const computer = await ComputerAPI.move(computerName, targetOU)

      onSuccess?.('move', computer)
      if (autoRefresh) await autoRefresh()

      return computer
    } catch (err) {
      return handleError('move', err)
    } finally {
      setMoving(false)
    }
  }, [onSuccess, autoRefresh, handleError, clearError])

  const isLoading = creating || deleting || enablingDisabling || moving

  return {
    // States
    creating,
    deleting,
    enablingDisabling,
    moving,
    error,
    isLoading,

    // Actions
    create,
    delete: deleteComputer,
    enable,
    disable,
    move,

    // Utilities
    clearError
  }
}
