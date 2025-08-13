// User Mutation Hooks for CRUD Operations

import { useState, useCallback } from 'react'
import { UserAPI } from '@/services/user-api'
import { ErrorHandler } from '@/lib/errors'
import type {
  SambaUser,
  CreateUserInput,
  UpdateUserInput
} from '@/types/samba'

export interface MutationState {
  loading: boolean;
  error: string | null;
}

export interface UseUserMutationsOptions {
  onSuccess?: (action: string, data?: any) => void;
  onError?: (action: string, error: string) => void;
  autoRefresh?: () => Promise<void>;
}

export interface UseUserMutationsReturn {
  // States
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  changingPassword: boolean;
  enablingDisabling: boolean;
  moving: boolean;
  error: string | null;

  // Actions
  create: (userData: CreateUserInput) => Promise<SambaUser | null>;
  update: (userData: UpdateUserInput) => Promise<SambaUser | null>;
  delete: (username: string) => Promise<boolean>;
  enable: (username: string) => Promise<SambaUser | null>;
  disable: (username: string) => Promise<SambaUser | null>;
  setPassword: (username: string, password: string) => Promise<boolean>;
  setExpiry: (username: string, expiry?: Date) => Promise<SambaUser | null>;
  move: (username: string, targetOU: string) => Promise<SambaUser | null>;
  addToGroups: (username: string, groups: string[]) => Promise<boolean>;
  removeFromGroups: (username: string, groups: string[]) => Promise<boolean>;

  // Utilities
  clearError: () => void;
  isLoading: boolean;
}

export const useUserMutations = (options: UseUserMutationsOptions = {}): UseUserMutationsReturn => {
  const { onSuccess, onError, autoRefresh } = options

  // Individual loading states
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [enablingDisabling, setEnablingDisabling] = useState(false)
  const [moving, setMoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((action: string, err: unknown) => {
    const apiError = ErrorHandler.handle(err, `useUserMutations.${action}`, {
      showToast: false,
      rethrow: false
    })
    setError(apiError.message)
    onError?.(action, apiError.message)
    return null
  }, [onError])

  const create = useCallback(async (userData: CreateUserInput): Promise<SambaUser | null> => {
    try {
      setCreating(true)
      clearError()

      const newUser = await UserAPI.create(userData)

      onSuccess?.('create', newUser)
      if (autoRefresh) await autoRefresh()

      return newUser
    } catch (err) {
      return handleError('create', err)
    } finally {
      setCreating(false)
    }
  }, [onSuccess, autoRefresh, handleError, clearError])

  const update = useCallback(async (userData: UpdateUserInput): Promise<SambaUser | null> => {
    try {
      setUpdating(true)
      clearError()

      const updatedUser = await UserAPI.update(userData)

      onSuccess?.('update', updatedUser)
      if (autoRefresh) await autoRefresh()

      return updatedUser
    } catch (err) {
      return handleError('update', err)
    } finally {
      setUpdating(false)
    }
  }, [onSuccess, autoRefresh, handleError, clearError])

  const deleteUser = useCallback(async (username: string): Promise<boolean> => {
    try {
      setDeleting(true)
      clearError()

      await UserAPI.delete(username)

      onSuccess?.('delete', { username })
      if (autoRefresh) await autoRefresh()

      return true
    } catch (err) {
      handleError('delete', err)
      return false
    } finally {
      setDeleting(false)
    }
  }, [onSuccess, autoRefresh, handleError, clearError])

  const enable = useCallback(async (username: string): Promise<SambaUser | null> => {
    try {
      setEnablingDisabling(true)
      clearError()

      const user = await UserAPI.enable(username)

      onSuccess?.('enable', user)
      if (autoRefresh) await autoRefresh()

      return user
    } catch (err) {
      return handleError('enable', err)
    } finally {
      setEnablingDisabling(false)
    }
  }, [onSuccess, autoRefresh, handleError, clearError])

  const disable = useCallback(async (username: string): Promise<SambaUser | null> => {
    try {
      setEnablingDisabling(true)
      clearError()

      const user = await UserAPI.disable(username)

      onSuccess?.('disable', user)
      if (autoRefresh) await autoRefresh()

      return user
    } catch (err) {
      return handleError('disable', err)
    } finally {
      setEnablingDisabling(false)
    }
  }, [onSuccess, autoRefresh, handleError, clearError])

  const setPassword = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      setChangingPassword(true)
      clearError()

      await UserAPI.setPassword(username, password)

      onSuccess?.('setPassword', { username })

      return true
    } catch (err) {
      handleError('setPassword', err)
      return false
    } finally {
      setChangingPassword(false)
    }
  }, [onSuccess, handleError, clearError])

  const setExpiry = useCallback(async (username: string, expiry?: Date): Promise<SambaUser | null> => {
    try {
      setUpdating(true)
      clearError()

      const user = await UserAPI.setExpiry(username, expiry)

      onSuccess?.('setExpiry', user)
      if (autoRefresh) await autoRefresh()

      return user
    } catch (err) {
      return handleError('setExpiry', err)
    } finally {
      setUpdating(false)
    }
  }, [onSuccess, autoRefresh, handleError, clearError])

  const move = useCallback(async (username: string, targetOU: string): Promise<SambaUser | null> => {
    try {
      setMoving(true)
      clearError()

      const user = await UserAPI.move(username, targetOU)

      onSuccess?.('move', user)
      if (autoRefresh) await autoRefresh()

      return user
    } catch (err) {
      return handleError('move', err)
    } finally {
      setMoving(false)
    }
  }, [onSuccess, autoRefresh, handleError, clearError])

  const addToGroups = useCallback(async (username: string, groups: string[]): Promise<boolean> => {
    try {
      setUpdating(true)
      clearError()

      await UserAPI.addToGroups(username, groups)

      onSuccess?.('addToGroups', { username, groups })
      if (autoRefresh) await autoRefresh()

      return true
    } catch (err) {
      handleError('addToGroups', err)
      return false
    } finally {
      setUpdating(false)
    }
  }, [onSuccess, autoRefresh, handleError, clearError])

  const removeFromGroups = useCallback(async (username: string, groups: string[]): Promise<boolean> => {
    try {
      setUpdating(true)
      clearError()

      await UserAPI.removeFromGroups(username, groups)

      onSuccess?.('removeFromGroups', { username, groups })
      if (autoRefresh) await autoRefresh()

      return true
    } catch (err) {
      handleError('removeFromGroups', err)
      return false
    } finally {
      setUpdating(false)
    }
  }, [onSuccess, autoRefresh, handleError, clearError])

  const isLoading = creating || updating || deleting || changingPassword || enablingDisabling || moving

  return {
    // States
    creating,
    updating,
    deleting,
    changingPassword,
    enablingDisabling,
    moving,
    error,
    isLoading,

    // Actions
    create,
    update,
    delete: deleteUser,
    enable,
    disable,
    setPassword,
    setExpiry,
    move,
    addToGroups,
    removeFromGroups,

    // Utilities
    clearError
  }
}
