import { useState, useEffect, useCallback } from 'react'
import { GroupAPI } from '../../services/group-api'
import { SambaGroup } from '../../types/samba'
import { APIError } from '../../lib/errors'

export interface UseGroupsReturn {
  groups: SambaGroup[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing groups data
 */
export const useGroups = (): UseGroupsReturn => {
  const [groups, setGroups] = useState<SambaGroup[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const groupsData = await GroupAPI.list()
      setGroups(groupsData)
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message)
      } else {
        setError('Failed to load groups')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchGroups()
  }, [fetchGroups])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  return {
    groups,
    loading,
    error,
    refresh
  }
}

/**
 * Hook for fetching group members
 */
export const useGroupMembers = (groupName: string | null) => {
  const [members, setMembers] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    if (!groupName) {
      setMembers([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const membersData = await GroupAPI.listMembers(groupName)
      setMembers(membersData)
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message)
      } else {
        setError('Failed to load group members')
      }
    } finally {
      setLoading(false)
    }
  }, [groupName])

  const refresh = useCallback(async () => {
    await fetchMembers()
  }, [fetchMembers])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return {
    members,
    loading,
    error,
    refresh
  }
}

/**
 * Hook for fetching detailed group information
 */
export const useGroupDetails = (groupName: string | null) => {
  const [group, setGroup] = useState<SambaGroup | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGroupDetails = useCallback(async () => {
    if (!groupName) {
      setGroup(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const groupData = await GroupAPI.show(groupName)
      setGroup(groupData)
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message)
      } else {
        setError('Failed to load group details')
      }
    } finally {
      setLoading(false)
    }
  }, [groupName])

  const refresh = useCallback(async () => {
    await fetchGroupDetails()
  }, [fetchGroupDetails])

  useEffect(() => {
    fetchGroupDetails()
  }, [fetchGroupDetails])

  return {
    group,
    loading,
    error,
    refresh
  }
}
