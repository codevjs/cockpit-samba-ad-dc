import { useCallback } from 'react'
import { ContactAPI } from '../../services/contact-api'
import { CreateContactInput, UpdateContactInput } from '../../types/samba'
import { APIError } from '../../lib/errors'

export interface UseContactMutationsReturn {
  createContact: (contactData: CreateContactInput) => Promise<void>;
  deleteContact: (contactName: string) => Promise<void>;
  moveContact: (contactName: string, targetOU: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for contact mutation operations (create, update, delete, etc.)
 */
export const useContactMutations = (onSuccess?: () => void, onError?: (error: string) => void): UseContactMutationsReturn => {
  const createContact = useCallback(async (contactData: CreateContactInput) => {
    try {
      await ContactAPI.create(contactData)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to create contact'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const deleteContact = useCallback(async (contactName: string) => {
    try {
      await ContactAPI.delete(contactName)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to delete contact'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  const moveContact = useCallback(async (contactName: string, targetOU: string) => {
    try {
      await ContactAPI.move(contactName, targetOU)
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to move contact'
      onError?.(errorMessage)
      throw err
    }
  }, [onSuccess, onError])

  return {
    createContact,
    deleteContact,
    moveContact,
    isLoading: false, // We handle loading states at the component level
    error: null // We handle errors via the callbacks
  }
}
