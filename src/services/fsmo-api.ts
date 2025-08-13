import { BaseAPI } from './base-api'
import { FSMORoles, TransferFSMORoleInput, SeizeFSMORoleInput } from '../types/samba'
import { APIError } from '../lib/errors'

export class FSMOAPI extends BaseAPI {
  /**
   * Show all FSMO roles and their current holders
   */
  static async showRoles (): Promise<FSMORoles> {
    try {
      const output = await this.executeCommand(['samba-tool', 'fsmo', 'show'])
      return this.parseFSMORoles(output)
    } catch (error) {
      throw new APIError(
        `Failed to show FSMO roles: ${(error as Error).message}`,
        'FSMO_SHOW_FAILED',
        error
      )
    }
  }

  /**
   * Transfer an FSMO role to another server
   */
  static async transferRole (transferData: TransferFSMORoleInput): Promise<void> {
    this.validateRequired(transferData as unknown as Record<string, unknown>, ['role', 'targetServer'])

    try {
      const roleArg = this.mapRoleToCommandArg(transferData.role)
      const command = ['samba-tool', 'fsmo', 'transfer', roleArg, '--server', transferData.targetServer]
      await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to transfer FSMO role: ${(error as Error).message}`,
        'FSMO_TRANSFER_FAILED',
        error
      )
    }
  }

  /**
   * Seize an FSMO role (forceful transfer)
   */
  static async seizeRole (seizeData: SeizeFSMORoleInput): Promise<void> {
    this.validateRequired(seizeData as unknown as Record<string, unknown>, ['role'])

    try {
      const roleArg = this.mapRoleToCommandArg(seizeData.role)
      const command = ['samba-tool', 'fsmo', 'seize', roleArg]
      await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to seize FSMO role: ${(error as Error).message}`,
        'FSMO_SEIZE_FAILED',
        error
      )
    }
  }

  /**
   * Map role enum to samba-tool command argument
   */
  private static mapRoleToCommandArg (role: string): string {
    const roleMap: Record<string, string> = {
      SchemaMaster: '--schema',
      DomainNamingMaster: '--naming',
      PDCEmulator: '--pdc',
      RIDMaster: '--rid',
      InfrastructureMaster: '--infrastructure'
    }

    return roleMap[role] || role.toLowerCase()
  }

  /**
   * Parse FSMO roles output from samba-tool
   */
  private static parseFSMORoles (output: string): FSMORoles {
    const lines = output.trim().split('\n')
    const roles: Partial<FSMORoles> = {}

    lines.forEach(line => {
      const trimmedLine = line.trim()

      if (trimmedLine.includes('SchemaMasterRole') || trimmedLine.includes('Schema master')) {
        roles.schemaMaster = this.extractServerFromLine(trimmedLine)
      } else if (trimmedLine.includes('DomainNamingMasterRole') || trimmedLine.includes('Domain naming master')) {
        roles.domainNamingMaster = this.extractServerFromLine(trimmedLine)
      } else if (trimmedLine.includes('PDCRole') || trimmedLine.includes('PDC emulator')) {
        roles.pdcEmulator = this.extractServerFromLine(trimmedLine)
      } else if (trimmedLine.includes('RidAllocationMasterRole') || trimmedLine.includes('RID master')) {
        roles.ridMaster = this.extractServerFromLine(trimmedLine)
      } else if (trimmedLine.includes('InfrastructureMasterRole') || trimmedLine.includes('Infrastructure master')) {
        roles.infrastructureMaster = this.extractServerFromLine(trimmedLine)
      }
    })

    return {
      schemaMaster: roles.schemaMaster || 'Unknown',
      domainNamingMaster: roles.domainNamingMaster || 'Unknown',
      ridMaster: roles.ridMaster || 'Unknown',
      pdcEmulator: roles.pdcEmulator || 'Unknown',
      infrastructureMaster: roles.infrastructureMaster || 'Unknown'
    }
  }

  /**
   * Extract server name from FSMO role line
   */
  private static extractServerFromLine (line: string): string {
    // Look for server name patterns in the line
    const serverMatch = line.match(/(?:CN=|owner:\s*)([^,\s]+)/i)
    if (serverMatch) {
      return serverMatch[1]
    }

    // If no match found, try to extract from the end of the line
    const parts = line.split(/[\s,]+/)
    const lastPart = parts[parts.length - 1]

    // Return the last part if it looks like a server name
    if (lastPart && lastPart.length > 0 && !lastPart.includes(':') && !lastPart.includes('=')) {
      return lastPart
    }

    return 'Unknown'
  }
}
