import { BaseAPI } from './base-api';
import { SambaOU, SambaOUObject, CreateOUInput, UpdateOUInput, MoveOUInput, RenameOUInput } from '../types/samba';
import { APIError } from '../lib/errors';

export class OrganizationUnitAPI extends BaseAPI {
  /**
   * Create a new organizational unit
   */
  static async createOU(ouData: CreateOUInput): Promise<void> {
    this.validateRequired(ouData as unknown as Record<string, unknown>, ['name']);
    
    try {
      const command = ['samba-tool', 'ou', 'create', ouData.name];
      
      if (ouData.description) {
        command.push('--description', ouData.description);
      }
      
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to create organizational unit: ${(error as Error).message}`,
        'OU_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Delete an organizational unit
   */
  static async deleteOU(ouDN: string): Promise<void> {
    this.validateRequired({ ouDN }, ['ouDN']);
    
    try {
      const command = ['samba-tool', 'ou', 'delete', ouDN];
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to delete organizational unit: ${(error as Error).message}`,
        'OU_DELETE_FAILED',
        error
      );
    }
  }

  /**
   * Move an organizational unit
   */
  static async moveOU(moveData: MoveOUInput): Promise<void> {
    this.validateRequired(moveData as unknown as Record<string, unknown>, ['ouDN', 'targetParentDN']);
    
    try {
      const command = ['samba-tool', 'ou', 'move', moveData.ouDN, moveData.targetParentDN];
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to move organizational unit: ${(error as Error).message}`,
        'OU_MOVE_FAILED',
        error
      );
    }
  }

  /**
   * Rename an organizational unit
   */
  static async renameOU(renameData: RenameOUInput): Promise<void> {
    this.validateRequired(renameData as unknown as Record<string, unknown>, ['ouDN', 'newName']);
    
    try {
      const command = ['samba-tool', 'ou', 'rename', renameData.ouDN, renameData.newName];
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to rename organizational unit: ${(error as Error).message}`,
        'OU_RENAME_FAILED',
        error
      );
    }
  }

  /**
   * List all organizational units
   */
  static async listOUs(): Promise<SambaOU[]> {
    try {
      const output = await this.executeCommand(['samba-tool', 'ou', 'list']);
      return this.parseOUList(output);
    } catch (error) {
      throw new APIError(
        `Failed to list organizational units: ${(error as Error).message}`,
        'OU_LIST_FAILED',
        error
      );
    }
  }

  /**
   * List objects in an organizational unit
   */
  static async listOUObjects(ouDN: string): Promise<SambaOUObject[]> {
    this.validateRequired({ ouDN }, ['ouDN']);
    
    try {
      const output = await this.executeCommand(['samba-tool', 'ou', 'listobjects', ouDN]);
      return this.parseOUObjects(output);
    } catch (error) {
      throw new APIError(
        `Failed to list OU objects: ${(error as Error).message}`,
        'OU_OBJECTS_LIST_FAILED',
        error
      );
    }
  }

  /**
   * Get detailed information about a specific OU
   */
  static async getOU(ouDN: string): Promise<SambaOU> {
    this.validateRequired({ ouDN }, ['ouDN']);
    
    try {
      const [ouList, ouObjects] = await Promise.all([
        this.listOUs(),
        this.listOUObjects(ouDN)
      ]);
      
      const ou = ouList.find(u => u.distinguishedName === ouDN);
      if (!ou) {
        throw new Error(`Organizational unit with DN "${ouDN}" not found`);
      }
      
      return {
        ...ou,
        objects: ouObjects
      };
    } catch (error) {
      throw new APIError(
        `Failed to get organizational unit: ${(error as Error).message}`,
        'OU_GET_FAILED',
        error
      );
    }
  }

  /**
   * Parse organizational unit list output from samba-tool
   */
  private static parseOUList(output: string): SambaOU[] {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '');
    
    return lines.map(line => {
      const dn = line.trim();
      const name = this.extractOUName(dn);
      const parentOU = this.extractParentOU(dn);
      
      return {
        name,
        distinguishedName: dn,
        description: '',
        parentOU,
        children: [],
        objects: [],
        createdAt: new Date()
      };
    });
  }

  /**
   * Parse OU objects output from samba-tool
   */
  private static parseOUObjects(output: string): SambaOUObject[] {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '');
    
    return lines.map(line => {
      const dn = line.trim();
      const name = this.extractObjectName(dn);
      const type = this.determineObjectType(dn);
      
      return {
        name,
        distinguishedName: dn,
        type,
        enabled: true // Default to enabled, would need additional queries to determine actual status
      };
    });
  }

  /**
   * Extract OU name from distinguished name
   */
  private static extractOUName(dn: string): string {
    const match = dn.match(/^OU=([^,]+)/);
    return match ? match[1] : dn;
  }

  /**
   * Extract parent OU from distinguished name
   */
  private static extractParentOU(dn: string): string | undefined {
    const parts = dn.split(',');
    if (parts.length > 1) {
      const parentParts = parts.slice(1);
      const parentOU = parentParts.find(part => part.trim().startsWith('OU='));
      return parentOU ? parentOU.trim() : undefined;
    }
    return undefined;
  }

  /**
   * Extract object name from distinguished name
   */
  private static extractObjectName(dn: string): string {
    const match = dn.match(/^(CN|OU)=([^,]+)/);
    return match ? match[2] : dn;
  }

  /**
   * Determine object type from distinguished name
   */
  private static determineObjectType(dn: string): 'User' | 'Computer' | 'Group' | 'Contact' {
    if (dn.includes('CN=Computers') || dn.toLowerCase().includes('computer')) {
      return 'Computer';
    } else if (dn.includes('CN=Users') && (dn.includes('Groups') || dn.toLowerCase().includes('group'))) {
      return 'Group';
    } else if (dn.toLowerCase().includes('contact')) {
      return 'Contact';
    } else {
      return 'User'; // Default to User for CN objects
    }
  }
}