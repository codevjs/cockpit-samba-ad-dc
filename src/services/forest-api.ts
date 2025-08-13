import { BaseAPI } from './base-api';
import { SambaForest, ForestDirectoryServiceInfo, SetDSHeuristicsInput } from '../types/samba';
import { APIError } from '../lib/errors';

export class ForestAPI extends BaseAPI {
  /**
   * Get forest information
   */
  static async getForestInfo(): Promise<SambaForest> {
    try {
      // Get basic forest info
      const forestOutput = await this.executeCommand(['samba-tool', 'domain', 'info']);
      const dsOutput = await this.executeCommand(['samba-tool', 'forest', 'directory_service', 'show']);
      
      const forestInfo = this.parseForestInfo(forestOutput, dsOutput);
      return forestInfo;
    } catch (error) {
      throw new APIError(
        `Failed to get forest information: ${(error as Error).message}`,
        'FOREST_INFO_FAILED',
        error
      );
    }
  }

  /**
   * Get directory service settings
   */
  static async getDirectoryServiceSettings(): Promise<ForestDirectoryServiceInfo[]> {
    try {
      const output = await this.executeCommand(['samba-tool', 'forest', 'directory_service', 'show']);
      return this.parseDirectoryServiceSettings(output);
    } catch (error) {
      throw new APIError(
        `Failed to get directory service settings: ${(error as Error).message}`,
        'DS_SETTINGS_FAILED',
        error
      );
    }
  }

  /**
   * Set dsheuristics value
   */
  static async setDSHeuristics(heuristicsData: SetDSHeuristicsInput): Promise<void> {
    this.validateRequired(heuristicsData as unknown as Record<string, unknown>, ['value']);
    
    try {
      const command = ['samba-tool', 'forest', 'directory_service', 'dsheuristics', heuristicsData.value];
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to set dsheuristics: ${(error as Error).message}`,
        'DS_HEURISTICS_SET_FAILED',
        error
      );
    }
  }

  /**
   * Parse forest information output
   */
  private static parseForestInfo(forestOutput: string, dsOutput: string): SambaForest {
    const forestLines = forestOutput.trim().split('\n');
    const dsSettings = dsOutput.trim().split('\n').filter(line => line.trim() !== '');
    
    // Parse basic forest info from output
    let domainName = '';
    let forestFunctionLevel = '';
    let domainFunctionLevel = '';
    let schemaVersion = '';
    
    forestLines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.includes('Domain:') || trimmedLine.includes('Domain ')) {
        domainName = trimmedLine.split(':')[1]?.trim() || trimmedLine.split(' ')[1]?.trim() || '';
      } else if (trimmedLine.includes('Forest function level:')) {
        forestFunctionLevel = trimmedLine.split(':')[1]?.trim() || '';
      } else if (trimmedLine.includes('Domain function level:')) {
        domainFunctionLevel = trimmedLine.split(':')[1]?.trim() || '';
      } else if (trimmedLine.includes('Schema version:')) {
        schemaVersion = trimmedLine.split(':')[1]?.trim() || '';
      }
    });

    return {
      name: domainName || 'Unknown Forest',
      domainName: domainName || '',
      forestFunctionLevel: forestFunctionLevel || 'Unknown',
      domainFunctionLevel: domainFunctionLevel || 'Unknown', 
      schemaVersion: schemaVersion || 'Unknown',
      directoryServiceSettings: dsSettings,
      createdAt: new Date()
    };
  }

  /**
   * Parse directory service settings output
   */
  private static parseDirectoryServiceSettings(output: string): ForestDirectoryServiceInfo[] {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '');
    
    return lines.map((line, index) => ({
      name: `Setting ${index + 1}`,
      value: line.trim(),
      description: this.getSettingDescription(line.trim())
    }));
  }

  /**
   * Get description for directory service settings
   */
  private static getSettingDescription(setting: string): string {
    if (setting.includes('dsheuristics')) {
      return 'Directory Service heuristics value that controls various AD behaviors';
    } else if (setting.includes('anonymous')) {
      return 'Anonymous access configuration';
    } else if (setting.includes('security')) {
      return 'Security-related directory service setting';
    } else if (setting.includes('replication')) {
      return 'Replication behavior configuration';
    }
    return 'Directory service configuration setting';
  }
}