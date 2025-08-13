import { BaseAPI } from './base-api';
import { SambaSPN, CreateSPNInput, DeleteSPNInput } from '../types/samba';
import { APIError } from '../lib/errors';

export class SPNAPI extends BaseAPI {
  /**
   * List SPNs for a specific user
   */
  static async list(username: string): Promise<SambaSPN[]> {
    this.validateRequired({ username }, ['username']);
    
    try {
      const output = await this.executeCommand(['samba-tool', 'spn', 'list', username]);
      return this.parseSPNList(output, username);
    } catch (error) {
      throw new APIError(
        `Failed to list SPNs for user ${username}: ${(error as Error).message}`,
        'SPN_LIST_FAILED',
        error
      );
    }
  }

  /**
   * Add a new SPN to a user
   */
  static async add(spnData: CreateSPNInput): Promise<void> {
    this.validateRequired(spnData as unknown as Record<string, unknown>, ['name', 'user']);
    
    try {
      const command = ['samba-tool', 'spn', 'add', spnData.name, spnData.user];
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to add SPN: ${(error as Error).message}`,
        'SPN_ADD_FAILED',
        error
      );
    }
  }

  /**
   * Delete an SPN from a user
   */
  static async delete(spnData: DeleteSPNInput): Promise<void> {
    this.validateRequired(spnData as unknown as Record<string, unknown>, ['name', 'user']);
    
    try {
      const command = ['samba-tool', 'spn', 'delete', spnData.name, spnData.user];
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to delete SPN: ${(error as Error).message}`,
        'SPN_DELETE_FAILED',
        error
      );
    }
  }

  /**
   * Parse SPN list output from samba-tool
   */
  private static parseSPNList(output: string, username: string): SambaSPN[] {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '');
    
    return lines.map(spnName => {
      // Parse SPN format: service/hostname:port
      const [serviceName, hostPart] = spnName.split('/');
      let hostName = hostPart;
      let port: number | undefined;
      
      if (hostPart && hostPart.includes(':')) {
        const [host, portStr] = hostPart.split(':');
        hostName = host;
        port = parseInt(portStr, 10);
      }
      
      return {
        name: spnName.trim(),
        user: username,
        serviceName: serviceName || spnName.trim(),
        hostName,
        port,
        createdAt: new Date()
      };
    });
  }
}