import { BaseAPI } from './base-api';
import { DSACLInfo, DSACLEntry, SetDSACLInput } from '../types/samba';
import { APIError } from '../lib/errors';

export class DSACLApi extends BaseAPI {
  /**
   * Get Directory Service Access Control List
   */
  static async getDSACL(objectDN?: string): Promise<DSACLInfo> {
    try {
      const command = ['samba-tool', 'dsacl', 'get'];
      
      if (objectDN) {
        command.push('--objectdn', objectDN);
      }
      
      const output = await this.executeCommand(command);
      return this.parseDSACLOutput(output, objectDN);
    } catch (error) {
      throw new APIError(
        `Failed to get DSACL: ${(error as Error).message}`,
        'DSACL_GET_FAILED',
        error
      );
    }
  }

  /**
   * Set Directory Service Access Control List
   */
  static async setDSACL(aclData: SetDSACLInput): Promise<void> {
    try {
      const command = ['samba-tool', 'dsacl', 'set'];
      
      if (aclData.url) {
        command.push(`--URL=${aclData.url}`);
      }
      if (aclData.car) {
        command.push(`--car=${aclData.car}`);
      }
      if (aclData.action) {
        command.push(`--action=${aclData.action}`);
      }
      if (aclData.objectDN) {
        command.push(`--objectdn=${aclData.objectDN}`);
      }
      if (aclData.trusteeDN) {
        command.push(`--trusteedn=${aclData.trusteeDN}`);
      }
      if (aclData.sddl) {
        command.push(`--sddl=${aclData.sddl}`);
      }
      
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to set DSACL: ${(error as Error).message}`,
        'DSACL_SET_FAILED',
        error
      );
    }
  }

  /**
   * Parse DSACL output from samba-tool
   */
  private static parseDSACLOutput(output: string, objectDN?: string): DSACLInfo {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '');
    const entries: DSACLEntry[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Parse ACL entry - this is a simplified parser
        // Real ACL entries would need more sophisticated parsing
        const entry: DSACLEntry = {
          id: `acl-${index}`,
          objectDN: objectDN || 'Unknown',
          trusteeDN: this.extractTrusteeDN(trimmedLine),
          permissions: this.extractPermissions(trimmedLine),
          accessType: this.extractAccessType(trimmedLine),
          inheritanceFlags: this.extractInheritanceFlags(trimmedLine),
          sddl: trimmedLine
        };
        entries.push(entry);
      }
    });
    
    return {
      objectDN: objectDN || 'Domain Root',
      entries,
      rawOutput: lines
    };
  }

  /**
   * Extract trustee DN from ACL line
   */
  private static extractTrusteeDN(aclLine: string): string {
    // Look for common trustee patterns
    const trusteeMatch = aclLine.match(/S-\d+-\d+-\d+(?:-\d+)*/);
    if (trusteeMatch) {
      return trusteeMatch[0];
    }
    
    // Look for DN patterns
    const dnMatch = aclLine.match(/CN=([^,;]+)/);
    if (dnMatch) {
      return dnMatch[0];
    }
    
    return 'Unknown';
  }

  /**
   * Extract permissions from ACL line
   */
  private static extractPermissions(aclLine: string): string[] {
    const permissions: string[] = [];
    
    // Common AD permissions patterns
    if (aclLine.includes('GA')) permissions.push('Generic All');
    if (aclLine.includes('GR')) permissions.push('Generic Read');
    if (aclLine.includes('GW')) permissions.push('Generic Write');
    if (aclLine.includes('GE')) permissions.push('Generic Execute');
    if (aclLine.includes('RC')) permissions.push('Read Control');
    if (aclLine.includes('WD')) permissions.push('Write DAC');
    if (aclLine.includes('WO')) permissions.push('Write Owner');
    if (aclLine.includes('RP')) permissions.push('Read Property');
    if (aclLine.includes('WP')) permissions.push('Write Property');
    if (aclLine.includes('CC')) permissions.push('Create Child');
    if (aclLine.includes('DC')) permissions.push('Delete Child');
    if (aclLine.includes('LC')) permissions.push('List Children');
    if (aclLine.includes('SW')) permissions.push('Self Write');
    if (aclLine.includes('LO')) permissions.push('List Object');
    if (aclLine.includes('DT')) permissions.push('Delete Tree');
    if (aclLine.includes('CR')) permissions.push('Control Access');
    
    return permissions.length > 0 ? permissions : ['Unknown'];
  }

  /**
   * Extract access type from ACL line
   */
  private static extractAccessType(aclLine: string): 'Allow' | 'Deny' {
    // Look for allow/deny indicators in SDDL
    if (aclLine.includes('(A;') || aclLine.includes('(OA;')) {
      return 'Allow';
    } else if (aclLine.includes('(D;') || aclLine.includes('(OD;')) {
      return 'Deny';
    }
    return 'Allow'; // Default to Allow
  }

  /**
   * Extract inheritance flags from ACL line
   */
  private static extractInheritanceFlags(aclLine: string): string[] {
    const flags: string[] = [];
    
    // Common inheritance flags in SDDL
    if (aclLine.includes('CI')) flags.push('Container Inherit');
    if (aclLine.includes('OI')) flags.push('Object Inherit');
    if (aclLine.includes('NP')) flags.push('No Propagate');
    if (aclLine.includes('IO')) flags.push('Inherit Only');
    if (aclLine.includes('ID')) flags.push('Inherited');
    
    return flags;
  }
}