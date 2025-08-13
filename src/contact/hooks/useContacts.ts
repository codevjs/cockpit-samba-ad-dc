import { useState, useCallback, useMemo, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ContactAPI } from '@/services/contact-api'
import { ErrorHandler } from '@/lib/errors'
import type {
  SambaContact,
  FilterOptions,
  SortOptions,
  PaginationOptions
} from '@/types/samba'

export interface UseContactsOptions {
  autoFetch?: boolean;
  filters?: FilterOptions;
  sort?: SortOptions;
  pagination?: PaginationOptions;
}

export interface UseContactsReturn {
  contacts: SambaContact[];
  loading: boolean;
  error: string | null;
  total: number;

  // Actions
  refresh: () => Promise<void>;
  setFilters: (filters: FilterOptions) => void;
  setSort: (sort: SortOptions) => void;
  setPagination: (pagination: PaginationOptions) => void;
  clearError: () => void;

  // Current state
  filters: FilterOptions;
  sort?: SortOptions;
  pagination?: PaginationOptions;
}

export const useContacts = (options: UseContactsOptions = {}): UseContactsReturn => {
  const {
    autoFetch = true,
    filters: initialFilters = {},
    sort: initialSort,
    pagination: initialPagination
  } = options

  const queryClient = useQueryClient()
  const [filters, setFiltersState] = useState<FilterOptions>(initialFilters)
  const [sort, setSortState] = useState<SortOptions | undefined>(initialSort)
  const [pagination, setPaginationState] = useState<PaginationOptions | undefined>(initialPagination)

  // Use React Query for data fetching
  const {
    data: contacts = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['contacts', filters],
    queryFn: () => ContactAPI.list(),
    enabled: autoFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  const error = queryError ? (queryError as Error).message : null

  // Apply sorting and filtering to the fetched data
  const processedContacts = useMemo(() => {
    let result = [...contacts]

    // Apply client-side search filtering
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      result = result.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.displayName?.toLowerCase().includes(searchTerm) ||
        contact.givenName?.toLowerCase().includes(searchTerm) ||
        contact.surname?.toLowerCase().includes(searchTerm) ||
        contact.mail?.toLowerCase().includes(searchTerm)
      )
    }

    // Apply OU filtering
    if (filters.organizationalUnit) {
      result = result.filter(contact =>
        contact.organizationalUnit === filters.organizationalUnit
      )
    }

    // Apply sorting if specified
    if (sort) {
      result.sort((a, b) => {
        const aValue = (a as any)[sort.field]
        const bValue = (b as any)[sort.field]

        if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    // Apply pagination if specified
    if (pagination) {
      const start = (pagination.page - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      result = result.slice(start, end)
    }

    return result
  }, [contacts, filters, sort, pagination])

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  const setFilters = useCallback((newFilters: FilterOptions) => {
    setFiltersState(newFilters)
    // Invalidate and refetch when filters change
    queryClient.invalidateQueries({ queryKey: ['contacts'] })
  }, [queryClient])

  const setSort = useCallback((newSort: SortOptions) => {
    setSortState(newSort)
  }, [])

  const setPagination = useCallback((newPagination: PaginationOptions) => {
    setPaginationState(newPagination)
  }, [])

  const clearError = useCallback(() => {
    // React Query handles error state automatically
  }, [])

  return {
    contacts: processedContacts,
    loading,
    error,
    total: contacts.length,
    refresh,
    setFilters,
    setSort,
    setPagination,
    clearError,
    filters,
    sort,
    pagination
  }
}

// Hook for managing a single contact
export interface UseContactOptions {
  contactName: string;
  autoFetch?: boolean;
}

export interface UseContactReturn {
  contact: SambaContact | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useContact = ({ contactName, autoFetch = true }: UseContactOptions): UseContactReturn => {
  const [contact, setContact] = useState<SambaContact | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContact = useCallback(async () => {
    if (!contactName) return

    try {
      setLoading(true)
      setError(null)

      const fetchedContact = await ContactAPI.show(contactName)
      setContact(fetchedContact)
    } catch (err) {
      const apiError = ErrorHandler.handle(err, 'useContact.fetchContact', {
        showToast: false,
        rethrow: false
      })
      setError(apiError.message)
      setContact(null)
    } finally {
      setLoading(false)
    }
  }, [contactName])

  const refresh = useCallback(async () => {
    await fetchContact()
  }, [fetchContact])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Auto-fetch on mount and when contactName changes
  useEffect(() => {
    if (autoFetch && contactName) {
      fetchContact()
    }
  }, [autoFetch, contactName, fetchContact])

  return {
    contact,
    loading,
    error,
    refresh,
    clearError
  }
}
