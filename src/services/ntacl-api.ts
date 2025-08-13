import { BaseAPI } from './base-api'
import {
  NTACLInfo,
  GetNTACLInput,
  SetNTACLInput,
  ChangeDomSIDInput,
  SysvolOperationInput,
  DOSInfo,
  NTACLPermission
} from '../types/samba'
import { APIError } from '../lib/errors'

export class NTACLApi extends BaseAPI {
  /**
   * Get NT ACL for a file
   */
  static async getNTACL (input: GetNTACLInput): Promise<NTACLInfo> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['file'])

    try {
      const command = ['samba-tool', 'ntacl', 'get', input.file]

      this.addOptionalParams(command, input)

      const output = await this.executeCommand(command)
      return this.parseNTACLOutput(output, input.file)
    } catch (error) {
      throw new APIError(
        `Failed to get NT ACL: ${(error as Error).message}`,
        'NTACL_GET_FAILED',
        error
      )
    }
  }

  /**
   * Set NT ACL for a file
   */
  static async setNTACL (input: SetNTACLInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['acl', 'file'])

    try {
      const command = ['samba-tool', 'ntacl', 'set', input.acl, input.file]

      this.addOptionalParams(command, input)

      await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to set NT ACL: ${(error as Error).message}`,
        'NTACL_SET_FAILED',
        error
      )
    }
  }

  /**
   * Change domain SID in ACLs
   */
  static async changeDomainSID (input: ChangeDomSIDInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['oldSid', 'newSid'])

    try {
      const command = ['samba-tool', 'ntacl', 'changedomsid', input.oldSid, input.newSid]

      this.addOptionalParams(command, input)

      await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to change domain SID: ${(error as Error).message}`,
        'NTACL_CHANGEDOMSID_FAILED',
        error
      )
    }
  }

  /**
   * Get DOS file information
   */
  static async getDOSInfo (input: GetNTACLInput): Promise<DOSInfo> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['file'])

    try {
      const command = ['samba-tool', 'ntacl', 'getdosinfo', input.file]

      this.addOptionalParams(command, input)

      const output = await this.executeCommand(command)
      return this.parseDOSInfo(output, input.file)
    } catch (error) {
      throw new APIError(
        `Failed to get DOS info: ${(error as Error).message}`,
        'NTACL_GETDOSINFO_FAILED',
        error
      )
    }
  }

  /**
   * Check SYSVOL ACLs
   */
  static async sysvolCheck (input: SysvolOperationInput = {}): Promise<string[]> {
    try {
      const command = ['samba-tool', 'ntacl', 'sysvolcheck']

      this.addOptionalParams(command, input)

      const output = await this.executeCommand(command)
      return output.split('\n').filter(line => line.trim() !== '')
    } catch (error) {
      throw new APIError(
        `Failed to check SYSVOL: ${(error as Error).message}`,
        'NTACL_SYSVOLCHECK_FAILED',
        error
      )
    }
  }

  /**
   * Reset SYSVOL ACLs
   */
  static async sysvolReset (input: SysvolOperationInput = {}): Promise<void> {
    try {
      const command = ['samba-tool', 'ntacl', 'sysvolreset']

      this.addOptionalParams(command, input)

      await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to reset SYSVOL: ${(error as Error).message}`,
        'NTACL_SYSVOLRESET_FAILED',
        error
      )
    }
  }

  /**
   * Add optional parameters to command
   */
  private static addOptionalParams (command: string[], input: any): void {
    if (input.xattrBackend) {
      command.push(`--xattr-backend=${input.xattrBackend}`)
    }
    if (input.eadbFile) {
      command.push(`--eadb-file=${input.eadbFile}`)
    }
    if (input.useNtvfs) {
      command.push(`--use-ntvfs=${input.useNtvfs}`)
    }
    if (input.useS3fs) {
      command.push(`--use-s3fs=${input.useS3fs}`)
    }
    if (input.service) {
      command.push(`--service=${input.service}`)
    }
  }

  /**
   * Parse NT ACL output
   */
  private static parseNTACLOutput (output: string, filePath: string): NTACLInfo {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '')
    const permissions: NTACLPermission[] = []

    // Simple parsing - in real implementation would need more sophisticated ACL parsing
    lines.forEach((line, _index) => {
      if (line.includes('(') && line.includes(')')) {
        permissions.push({
          trustee: this.extractTrustee(line),
          permissions: this.extractNTPermissions(line),
          accessType: line.includes('(A;') ? 'Allow' : 'Deny',
          inheritance: this.extractInheritance(line)
        })
      }
    })

    return {
      filePath,
      acl: output,
      permissions,
      rawOutput: lines
    }
  }

  /**
   * Parse DOS info output
   */
  private static parseDOSInfo (output: string, filePath: string): DOSInfo {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '')
    const attributes: string[] = []

    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine.includes('attribute') || trimmedLine.includes('flag')) {
        // Extract DOS attributes from the line
        const attrMatch = trimmedLine.match(/(\w+)\s+attribute/)
        if (attrMatch) {
          attributes.push(attrMatch[1])
        }
      }
    })

    return {
      filePath,
      attributes,
      rawOutput: lines
    }
  }

  /**
   * Extract trustee from ACL line
   */
  private static extractTrustee (line: string): string {
    // Look for SID pattern
    const sidMatch = line.match(/S-\d+-\d+-\d+(?:-\d+)*/)
    if (sidMatch) {
      return sidMatch[0]
    }

    // Look for domain\\user pattern
    const userMatch = line.match(/([A-Z]+)\\([A-Za-z0-9_]+)/)
    if (userMatch) {
      return userMatch[0]
    }

    return 'Unknown'
  }

  /**
   * Extract NT permissions from ACL line
   */
  private static extractNTPermissions (line: string): string[] {
    const permissions: string[] = []

    // NT ACL permission flags
    if (line.includes('GA')) permissions.push('Generic All')
    if (line.includes('GR')) permissions.push('Generic Read')
    if (line.includes('GW')) permissions.push('Generic Write')
    if (line.includes('GE')) permissions.push('Generic Execute')
    if (line.includes('RC')) permissions.push('Read Control')
    if (line.includes('WD')) permissions.push('Write DAC')
    if (line.includes('WO')) permissions.push('Write Owner')
    if (line.includes('FA')) permissions.push('File All Access')
    if (line.includes('FR')) permissions.push('File Generic Read')
    if (line.includes('FW')) permissions.push('File Generic Write')
    if (line.includes('FX')) permissions.push('File Generic Execute')

    return permissions.length > 0 ? permissions : ['Unknown']
  }

  /**
   * Extract inheritance flags from ACL line
   */
  private static extractInheritance (line: string): string[] {
    const flags: string[] = []

    if (line.includes('CI')) flags.push('Container Inherit')
    if (line.includes('OI')) flags.push('Object Inherit')
    if (line.includes('NP')) flags.push('No Propagate')
    if (line.includes('IO')) flags.push('Inherit Only')
    if (line.includes('ID')) flags.push('Inherited')

    return flags
  }
}
