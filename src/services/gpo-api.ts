import { BaseAPI } from './base-api';
import { 
  SambaGPO,
  CreateGPOInput,
  UpdateGPOInput,
  DeleteGPOInput,
  BackupGPOInput,
  RestoreGPOInput,
  FetchGPOInput,
  GPOLink,
  SetGPOLinkInput,
  DeleteGPOLinkInput,
  GPOInheritance,
  SetGPOInheritanceInput,
  GPOContainer
} from '../types/samba';
import { APIError } from '../lib/errors';

export class GPOAPI extends BaseAPI {
  /**
   * List all GPOs
   */
  static async listGPOs(): Promise<SambaGPO[]> {
    try {
      const command = ['samba-tool', 'gpo', 'listall'];
      const output = await this.executeCommand(command);
      return this.parseGPOList(output);
    } catch (error) {
      throw new APIError(
        `Failed to list GPOs: ${(error as Error).message}`,
        'GPO_LIST_FAILED',
        error
      );
    }
  }

  /**
   * List specific GPOs
   */
  static async listSpecificGPOs(): Promise<SambaGPO[]> {
    try {
      const command = ['samba-tool', 'gpo', 'list'];
      const output = await this.executeCommand(command);
      return this.parseGPOList(output);
    } catch (error) {
      throw new APIError(
        `Failed to list specific GPOs: ${(error as Error).message}`,
        'GPO_LIST_SPECIFIC_FAILED',
        error
      );
    }
  }

  /**
   * Show GPO details
   */
  static async showGPO(name: string): Promise<SambaGPO> {
    this.validateRequired({ name }, ['name']);
    
    try {
      const command = ['samba-tool', 'gpo', 'show', name];
      const output = await this.executeCommand(command);
      return this.parseGPODetails(output, name);
    } catch (error) {
      throw new APIError(
        `Failed to show GPO details: ${(error as Error).message}`,
        'GPO_SHOW_FAILED',
        error
      );
    }
  }

  /**
   * Create a new GPO
   */
  static async createGPO(input: CreateGPOInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['name', 'displayName']);
    
    try {
      const command = ['samba-tool', 'gpo', 'create', input.name, input.displayName];
      
      if (input.description) {
        command.push('--description', input.description);
      }
      
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to create GPO: ${(error as Error).message}`,
        'GPO_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Delete a GPO
   */
  static async deleteGPO(input: DeleteGPOInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['name']);
    
    try {
      const command = ['samba-tool', 'gpo', 'del', input.name];
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to delete GPO: ${(error as Error).message}`,
        'GPO_DELETE_FAILED',
        error
      );
    }
  }

  /**
   * Backup a GPO
   */
  static async backupGPO(input: BackupGPOInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['name', 'backupPath']);
    
    try {
      const command = ['samba-tool', 'gpo', 'backup', input.name, input.backupPath];
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to backup GPO: ${(error as Error).message}`,
        'GPO_BACKUP_FAILED',
        error
      );
    }
  }

  /**
   * Restore a GPO
   */
  static async restoreGPO(input: RestoreGPOInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['name', 'backupPath']);
    
    try {
      const command = ['samba-tool', 'gpo', 'restore', input.name, input.backupPath];
      
      if (input.newName) {
        command.push('--newname', input.newName);
      }
      
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to restore GPO: ${(error as Error).message}`,
        'GPO_RESTORE_FAILED',
        error
      );
    }
  }

  /**
   * Fetch a GPO
   */
  static async fetchGPO(input: FetchGPOInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['name', 'targetPath']);
    
    try {
      const command = ['samba-tool', 'gpo', 'fetch', input.name, input.targetPath];
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to fetch GPO: ${(error as Error).message}`,
        'GPO_FETCH_FAILED',
        error
      );
    }
  }

  /**
   * Get GPO links for a container
   */
  static async getGPOLinks(containerDN: string): Promise<GPOLink[]> {
    this.validateRequired({ containerDN }, ['containerDN']);
    
    try {
      const command = ['samba-tool', 'gpo', 'getlink', containerDN];
      const output = await this.executeCommand(command);
      return this.parseGPOLinks(output, containerDN);
    } catch (error) {
      throw new APIError(
        `Failed to get GPO links: ${(error as Error).message}`,
        'GPO_GET_LINKS_FAILED',
        error
      );
    }
  }

  /**
   * Set a GPO link
   */
  static async setGPOLink(input: SetGPOLinkInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['containerDN', 'gpoName']);
    
    try {
      const command = ['samba-tool', 'gpo', 'setlink', input.containerDN, input.gpoName];
      
      if (input.linkOptions) {
        command.push('--linkopt', input.linkOptions);
      }
      
      if (input.order !== undefined) {
        command.push('--order', input.order.toString());
      }
      
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to set GPO link: ${(error as Error).message}`,
        'GPO_SET_LINK_FAILED',
        error
      );
    }
  }

  /**
   * Delete a GPO link
   */
  static async deleteGPOLink(input: DeleteGPOLinkInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['containerDN', 'gpoName']);
    
    try {
      const command = ['samba-tool', 'gpo', 'dellink', input.containerDN, input.gpoName];
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to delete GPO link: ${(error as Error).message}`,
        'GPO_DELETE_LINK_FAILED',
        error
      );
    }
  }

  /**
   * Get GPO inheritance for a container
   */
  static async getGPOInheritance(containerDN: string): Promise<GPOInheritance> {
    this.validateRequired({ containerDN }, ['containerDN']);
    
    try {
      const command = ['samba-tool', 'gpo', 'getinheritance', containerDN];
      const output = await this.executeCommand(command);
      return this.parseGPOInheritance(output, containerDN);
    } catch (error) {
      throw new APIError(
        `Failed to get GPO inheritance: ${(error as Error).message}`,
        'GPO_GET_INHERITANCE_FAILED',
        error
      );
    }
  }

  /**
   * Set GPO inheritance for a container
   */
  static async setGPOInheritance(input: SetGPOInheritanceInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['containerDN', 'inheritance']);
    
    try {
      const command = ['samba-tool', 'gpo', 'setinheritance', input.containerDN, input.inheritance];
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to set GPO inheritance: ${(error as Error).message}`,
        'GPO_SET_INHERITANCE_FAILED',
        error
      );
    }
  }

  /**
   * List containers for GPO linking
   */
  static async listContainers(): Promise<GPOContainer[]> {
    try {
      const command = ['samba-tool', 'gpo', 'listcontainers'];
      const output = await this.executeCommand(command);
      return this.parseGPOContainers(output);
    } catch (error) {
      throw new APIError(
        `Failed to list containers: ${(error as Error).message}`,
        'GPO_LIST_CONTAINERS_FAILED',
        error
      );
    }
  }

  /**
   * Parse GPO list output
   */
  private static parseGPOList(output: string): SambaGPO[] {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '');
    const gpos: SambaGPO[] = [];
    
    let currentGPO: Partial<SambaGPO> = {};
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('GPO:')) {
        if (currentGPO.name) {
          gpos.push(this.completeGPO(currentGPO));
        }
        currentGPO = {};
        const gpoMatch = trimmedLine.match(/GPO:\s*(.+)/);
        if (gpoMatch) {
          currentGPO.name = gpoMatch[1];
        }
      } else if (trimmedLine.includes('display name:')) {
        const displayMatch = trimmedLine.match(/display name:\s*(.+)/i);
        if (displayMatch) {
          currentGPO.displayName = displayMatch[1];
        }
      } else if (trimmedLine.includes('GUID:')) {
        const guidMatch = trimmedLine.match(/GUID:\s*(.+)/i);
        if (guidMatch) {
          currentGPO.guid = guidMatch[1];
        }
      }
    });
    
    if (currentGPO.name) {
      gpos.push(this.completeGPO(currentGPO));
    }
    
    return gpos;
  }

  /**
   * Parse GPO details output
   */
  private static parseGPODetails(output: string, name: string): SambaGPO {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '');
    const gpo: Partial<SambaGPO> = { name };
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('display name:')) {
        const displayMatch = trimmedLine.match(/display name:\s*(.+)/i);
        if (displayMatch) {
          gpo.displayName = displayMatch[1];
        }
      } else if (trimmedLine.includes('GUID:')) {
        const guidMatch = trimmedLine.match(/GUID:\s*(.+)/i);
        if (guidMatch) {
          gpo.guid = guidMatch[1];
        }
      } else if (trimmedLine.includes('version:')) {
        const versionMatch = trimmedLine.match(/version:\s*(\d+)/i);
        if (versionMatch) {
          gpo.version = parseInt(versionMatch[1], 10);
        }
      }
    });
    
    return this.completeGPO(gpo);
  }

  /**
   * Parse GPO links output
   */
  private static parseGPOLinks(output: string, containerDN: string): GPOLink[] {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '');
    const links: GPOLink[] = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.includes('GPO:')) {
        const gpoMatch = trimmedLine.match(/GPO:\s*(.+)/);
        if (gpoMatch) {
          links.push({
            containerDN,
            gpoName: gpoMatch[1],
            linkOptions: 'Enabled',
            order: links.length + 1
          });
        }
      }
    });
    
    return links;
  }

  /**
   * Parse GPO inheritance output
   */
  private static parseGPOInheritance(output: string, containerDN: string): GPOInheritance {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '');
    let inheritance: 'Enabled' | 'Disabled' = 'Enabled';
    
    lines.forEach(line => {
      const trimmedLine = line.trim().toLowerCase();
      if (trimmedLine.includes('disabled') || trimmedLine.includes('blocked')) {
        inheritance = 'Disabled';
      }
    });
    
    return {
      containerDN,
      inheritance
    };
  }

  /**
   * Parse GPO containers output
   */
  private static parseGPOContainers(output: string): GPOContainer[] {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '');
    const containers: GPOContainer[] = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.includes('DN:')) {
        const dnMatch = trimmedLine.match(/DN:\s*(.+)/);
        if (dnMatch) {
          const dn = dnMatch[1];
          const name = this.extractNameFromDN(dn);
          const type = this.determineContainerType(dn);
          
          containers.push({
            distinguishedName: dn,
            name,
            type
          });
        }
      }
    });
    
    return containers;
  }

  /**
   * Complete GPO object with default values
   */
  private static completeGPO(gpo: Partial<SambaGPO>): SambaGPO {
    return {
      name: gpo.name || '',
      displayName: gpo.displayName || gpo.name || '',
      guid: gpo.guid || '',
      status: 'Enabled',
      createdAt: new Date(),
      modifiedAt: new Date(),
      version: gpo.version || 1,
      linkedOUs: [],
      description: gpo.description
    };
  }

  /**
   * Extract name from distinguished name
   */
  private static extractNameFromDN(dn: string): string {
    const nameMatch = dn.match(/(?:CN|OU)=([^,]+)/);
    return nameMatch ? nameMatch[1] : dn;
  }

  /**
   * Determine container type from DN
   */
  private static determineContainerType(dn: string): 'OU' | 'Domain' | 'Site' {
    if (dn.includes('OU=')) {
      return 'OU';
    } else if (dn.includes('CN=Sites')) {
      return 'Site';
    } else {
      return 'Domain';
    }
  }
}