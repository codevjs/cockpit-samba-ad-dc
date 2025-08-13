import { useCallback } from 'react';
import { GroupAPI } from '../../services/group-api';
import { CreateGroupInput, UpdateGroupInput } from '../../types/samba';
import { APIError } from '../../lib/errors';

export interface UseGroupMutationsReturn {
  createGroup: (groupData: CreateGroupInput) => Promise<void>;
  deleteGroup: (groupName: string) => Promise<void>;
  moveGroup: (groupName: string, targetOU: string) => Promise<void>;
  addMembers: (groupName: string, memberNames: string[]) => Promise<void>;
  removeMembers: (groupName: string, memberNames: string[]) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for group mutation operations (create, update, delete, etc.)
 */
export const useGroupMutations = (onSuccess?: () => void, onError?: (error: string) => void): UseGroupMutationsReturn => {
  const createGroup = useCallback(async (groupData: CreateGroupInput) => {
    try {
      await GroupAPI.create(groupData);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to create group';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  const deleteGroup = useCallback(async (groupName: string) => {
    try {
      await GroupAPI.delete(groupName);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to delete group';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  const moveGroup = useCallback(async (groupName: string, targetOU: string) => {
    try {
      await GroupAPI.move(groupName, targetOU);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to move group';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  const addMembers = useCallback(async (groupName: string, memberNames: string[]) => {
    try {
      await GroupAPI.addMembers(groupName, memberNames);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to add group members';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  const removeMembers = useCallback(async (groupName: string, memberNames: string[]) => {
    try {
      await GroupAPI.removeMembers(groupName, memberNames);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to remove group members';
      onError?.(errorMessage);
      throw err;
    }
  }, [onSuccess, onError]);

  return {
    createGroup,
    deleteGroup,
    moveGroup,
    addMembers,
    removeMembers,
    isLoading: false, // We handle loading states at the component level
    error: null // We handle errors via the callbacks
  };
};