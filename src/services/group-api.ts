import { BaseAPI } from './base-api';
import { SambaGroup, CreateGroupInput, UpdateGroupInput } from '../types/samba';
import { APIError } from '../lib/errors';

export class GroupAPI extends BaseAPI {
  /**
   * List all groups
   */
  static async list(): Promise<SambaGroup[]> {
    try {
      const output = await this.executeCommand(['samba-tool', 'group', 'list']);
      return this.parseGroupList(output);
    } catch (error) {
      throw new APIError(
        `Failed to fetch groups: ${(error as Error).message}`,
        'GROUP_LIST_FAILED',
        error
      );
    }
  }

  /**
   * Get detailed information about a specific group
   */
  static async show(groupName: string): Promise<SambaGroup> {
    try {
      const output = await this.executeCommand(['samba-tool', 'group', 'show', groupName]);
      return this.parseGroupDetails(output, groupName);
    } catch (error) {
      throw new APIError(
        `Failed to fetch group details: ${(error as Error).message}`,
        'GROUP_SHOW_FAILED',
        error
      );
    }
  }

  /**
   * Create a new group
   */
  static async create(groupData: CreateGroupInput): Promise<SambaGroup> {
    try {
      const command = ['samba-tool', 'group', 'add', groupData.name];
      
      if (groupData.description) {
        command.push('--description', groupData.description);
      }
      
      if (groupData.groupType) {
        const groupScope = groupData.groupType === 'Security' ? '--group-scope=Global' : '--group-scope=Universal';
        command.push(groupScope);
      }

      await this.executeCommand(command);
      
      // Return the created group by fetching its details
      return await this.show(groupData.name);
    } catch (error) {
      throw new APIError(
        `Failed to create group: ${(error as Error).message}`,
        'GROUP_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Delete a group
   */
  static async delete(groupName: string): Promise<void> {
    try {
      await this.executeCommand(['samba-tool', 'group', 'delete', groupName]);
    } catch (error) {
      throw new APIError(
        `Failed to delete group: ${(error as Error).message}`,
        'GROUP_DELETE_FAILED',
        error
      );
    }
  }

  /**
   * Move a group to a different organizational unit
   */
  static async move(groupName: string, targetOU: string): Promise<SambaGroup> {
    try {
      await this.executeCommand([
        'samba-tool', 'group', 'move', 
        groupName, 
        targetOU
      ]);
      
      return await this.show(groupName);
    } catch (error) {
      throw new APIError(
        `Failed to move group: ${(error as Error).message}`,
        'GROUP_MOVE_FAILED',
        error
      );
    }
  }

  /**
   * List members of a group
   */
  static async listMembers(groupName: string): Promise<string[]> {
    try {
      const output = await this.executeCommand(['samba-tool', 'group', 'listmembers', groupName]);
      return output.trim().split('\n').filter(member => member.trim() !== '');
    } catch (error) {
      throw new APIError(
        `Failed to list group members: ${(error as Error).message}`,
        'GROUP_LIST_MEMBERS_FAILED',
        error
      );
    }
  }

  /**
   * Add members to a group
   */
  static async addMembers(groupName: string, memberNames: string[]): Promise<void> {
    try {
      for (const memberName of memberNames) {
        await this.executeCommand([
          'samba-tool', 'group', 'addmembers', 
          groupName, 
          memberName
        ]);
      }
    } catch (error) {
      throw new APIError(
        `Failed to add group members: ${(error as Error).message}`,
        'GROUP_ADD_MEMBERS_FAILED',
        error
      );
    }
  }

  /**
   * Remove members from a group
   */
  static async removeMembers(groupName: string, memberNames: string[]): Promise<void> {
    try {
      for (const memberName of memberNames) {
        await this.executeCommand([
          'samba-tool', 'group', 'removemembers', 
          groupName, 
          memberName
        ]);
      }
    } catch (error) {
      throw new APIError(
        `Failed to remove group members: ${(error as Error).message}`,
        'GROUP_REMOVE_MEMBERS_FAILED',
        error
      );
    }
  }

  /**
   * Parse group list output from samba-tool
   */
  private static parseGroupList(output: string): SambaGroup[] {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '');
    
    return lines.map(groupName => ({
      name: groupName.trim(),
      description: '',
      members: [],
      groupType: 'Security' as const,
      groupScope: 'Global' as const,
      memberOf: [],
      distinguishedName: `CN=${groupName.trim()},CN=Users,DC=domain,DC=local`,
      createdAt: new Date()
    }));
  }

  /**
   * Parse detailed group information from samba-tool show output
   */
  private static parseGroupDetails(output: string, groupName: string): SambaGroup {
    const lines = output.trim().split('\n');
    const group: SambaGroup = {
      name: groupName,
      description: '',
      members: [],
      groupType: 'Security' as const,
      groupScope: 'Global' as const,
      memberOf: [],
      distinguishedName: '',
      createdAt: new Date()
    };

    lines.forEach(line => {
      if (line.includes('description:')) {
        group.description = line.split('description:')[1]?.trim() || '';
      } else if (line.includes('distinguishedName:')) {
        group.distinguishedName = line.split('distinguishedName:')[1]?.trim() || '';
      } else if (line.includes('groupType:')) {
        const groupType = line.split('groupType:')[1]?.trim();
        group.groupType = groupType?.includes('Security') ? 'Security' : 'Distribution';
      }
    });

    return group;
  }
}