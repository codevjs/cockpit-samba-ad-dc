import { BaseAPI } from './base-api'
import {
  DomainInfo,
  TrustRelationship,
  BackupInfo,
  CreateTrustInput,
  DomainJoinInput,
  BackupOfflineInput,
  BackupOnlineInput,
  BackupRenameInput,
  BackupRestoreInput
} from '../types/samba'
import { APIError } from '../lib/errors'

export class DomainAPI extends BaseAPI {
  /**
   * Get domain information
   */
  static async getInfo (ipAddress?: string): Promise<DomainInfo> {
    try {
      const command = ['samba-tool', 'domain', 'info']
      if (ipAddress) {
        command.push(ipAddress)
      }

      const output = await this.executeCommand(command)
      return this.parseDomainInfo(output)
    } catch (error) {
      throw new APIError(
        `Failed to get domain info: ${(error as Error).message}`,
        'DOMAIN_INFO_FAILED',
        error
      )
    }
  }

  /**
   * Join a domain
   */
  static async join (joinData: DomainJoinInput): Promise<string> {
    try {
      const command = [
        'samba-tool', 'domain', 'join',
        joinData.domain,
        'DC' // Default role for domain controller
      ]

      if (joinData.username) {
        command.push('-U', joinData.username)
      }

      if (joinData.password) {
        command.push('--password', joinData.password)
      }

      if (joinData.organizationalUnit) {
        command.push('--machinepass', joinData.organizationalUnit)
      }

      if (joinData.computerName) {
        command.push('--server', joinData.computerName)
      }

      return await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to join domain: ${(error as Error).message}`,
        'DOMAIN_JOIN_FAILED',
        error
      )
    }
  }

  /**
   * Demote domain controller
   */
  static async demote (username?: string, password?: string): Promise<string> {
    try {
      const command = ['samba-tool', 'domain', 'demote']

      if (username) {
        command.push('-U', username)
      }

      if (password) {
        command.push('--password', password)
      }

      return await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to demote domain controller: ${(error as Error).message}`,
        'DOMAIN_DEMOTE_FAILED',
        error
      )
    }
  }

  /**
   * Promote to domain controller (dcpromo equivalent)
   */
  static async promote (domain: string, adminPassword: string): Promise<string> {
    try {
      const command = [
        'samba-tool', 'domain', 'provision',
        '--domain', domain,
        '--adminpass', adminPassword,
        '--server-role=dc'
      ]

      return await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to promote to domain controller: ${(error as Error).message}`,
        'DOMAIN_PROMOTE_FAILED',
        error
      )
    }
  }

  /**
   * Classic upgrade from NT4
   */
  static async classicUpgrade (ntdbPath: string): Promise<string> {
    try {
      const command = [
        'samba-tool', 'domain', 'classicupgrade',
        '--dbdir', ntdbPath
      ]

      return await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to perform classic upgrade: ${(error as Error).message}`,
        'DOMAIN_CLASSIC_UPGRADE_FAILED',
        error
      )
    }
  }

  // Backup Operations

  /**
   * Create offline backup
   */
  static async backupOffline (backupData: BackupOfflineInput): Promise<BackupInfo> {
    try {
      const command = [
        'samba-tool', 'domain', 'backup', 'offline',
        '--targetdir', backupData.targetdir
      ]

      // Compress option not available in standard BackupOfflineInput
      // Will need to extend the interface if compression is needed

      const output = await this.executeCommand(command)
      return this.parseBackupInfo(output, 'offline')
    } catch (error) {
      throw new APIError(
        `Failed to create offline backup: ${(error as Error).message}`,
        'DOMAIN_BACKUP_OFFLINE_FAILED',
        error
      )
    }
  }

  /**
   * Create online backup
   */
  static async backupOnline (backupData: BackupOnlineInput): Promise<BackupInfo> {
    try {
      const command = [
        'samba-tool', 'domain', 'backup', 'online',
        '--targetdir', backupData.targetdir,
        '--server', backupData.server
      ]

      // Username and password not in BackupOnlineInput interface
      // Using server property only as per interface definition

      const output = await this.executeCommand(command.filter(arg => arg !== undefined))
      return this.parseBackupInfo(output, 'online')
    } catch (error) {
      throw new APIError(
        `Failed to create online backup: ${(error as Error).message}`,
        'DOMAIN_BACKUP_ONLINE_FAILED',
        error
      )
    }
  }

  /**
   * Rename backup
   */
  static async backupRename (renameData: BackupRenameInput): Promise<string> {
    try {
      const command = [
        'samba-tool', 'domain', 'backup', 'rename',
        renameData.oldname,
        renameData.newname
      ]

      return await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to rename backup: ${(error as Error).message}`,
        'DOMAIN_BACKUP_RENAME_FAILED',
        error
      )
    }
  }

  /**
   * Restore from backup
   */
  static async backupRestore (restoreData: BackupRestoreInput): Promise<string> {
    try {
      const command = [
        'samba-tool', 'domain', 'backup', 'restore',
        '--backup-file', restoreData.backup
      ]

      if (restoreData.targetdir) {
        command.push('--targetdir', restoreData.targetdir)
      }

      if (restoreData.newbasedn) {
        command.push('--newbasedn', restoreData.newbasedn)
      }

      return await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to restore backup: ${(error as Error).message}`,
        'DOMAIN_BACKUP_RESTORE_FAILED',
        error
      )
    }
  }

  // Trust Operations

  /**
   * List trust relationships
   */
  static async listTrusts (): Promise<TrustRelationship[]> {
    try {
      const output = await this.executeCommand(['samba-tool', 'domain', 'trust', 'list'])
      return this.parseTrustList(output)
    } catch (error) {
      throw new APIError(
        `Failed to list trusts: ${(error as Error).message}`,
        'DOMAIN_TRUST_LIST_FAILED',
        error
      )
    }
  }

  /**
   * Create trust relationship
   */
  static async createTrust (trustData: CreateTrustInput): Promise<TrustRelationship> {
    try {
      const command = [
        'samba-tool', 'domain', 'trust', 'create',
        trustData.trustDomain,
        '--type', trustData.trustType.toLowerCase(),
        '--direction', trustData.trustDirection.toLowerCase()
      ]

      if (trustData.trustPassword) {
        command.push('--password', trustData.trustPassword)
      }

      const output = await this.executeCommand(command)
      return this.parseTrustInfo(output, trustData.trustDomain)
    } catch (error) {
      throw new APIError(
        `Failed to create trust: ${(error as Error).message}`,
        'DOMAIN_TRUST_CREATE_FAILED',
        error
      )
    }
  }

  /**
   * Delete trust relationship
   */
  static async deleteTrust (domain: string, username?: string, password?: string): Promise<void> {
    try {
      const command = ['samba-tool', 'domain', 'trust', 'delete', domain]

      if (username) {
        command.push('-U', username)
      }

      if (password) {
        command.push('--password', password)
      }

      await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to delete trust: ${(error as Error).message}`,
        'DOMAIN_TRUST_DELETE_FAILED',
        error
      )
    }
  }

  /**
   * Show trust relationship details
   */
  static async showTrust (domain: string): Promise<TrustRelationship> {
    try {
      const output = await this.executeCommand(['samba-tool', 'domain', 'trust', 'show', domain])
      return this.parseTrustInfo(output, domain)
    } catch (error) {
      throw new APIError(
        `Failed to show trust details: ${(error as Error).message}`,
        'DOMAIN_TRUST_SHOW_FAILED',
        error
      )
    }
  }

  /**
   * Validate trust relationship
   */
  static async validateTrust (domain: string): Promise<{ valid: boolean; message: string }> {
    try {
      const output = await this.executeCommand(['samba-tool', 'domain', 'trust', 'validate', domain])
      return this.parseTrustValidation(output)
    } catch (error) {
      throw new APIError(
        `Failed to validate trust: ${(error as Error).message}`,
        'DOMAIN_TRUST_VALIDATE_FAILED',
        error
      )
    }
  }

  /**
   * List trust namespaces
   */
  static async listNamespaces (domain: string): Promise<string[]> {
    try {
      const output = await this.executeCommand(['samba-tool', 'domain', 'trust', 'namespaces', domain])
      return output.trim().split('\n').filter(line => line.trim() !== '')
    } catch (error) {
      throw new APIError(
        `Failed to list trust namespaces: ${(error as Error).message}`,
        'DOMAIN_TRUST_NAMESPACES_FAILED',
        error
      )
    }
  }

  // Parsing methods

  private static parseDomainInfo (output: string): DomainInfo {
    const lines = output.trim().split('\n')
    const info: DomainInfo = {
      name: '',
      realm: '',
      domainSid: '',
      forestFunctionLevel: '',
      domainFunctionLevel: '',
      schemaVersion: '',
      netbiosName: '',
      dnsRoot: '',
      domainControllers: [],
      fsmoRoles: {
        schemaMaster: '',
        domainNamingMaster: '',
        ridMaster: '',
        pdcEmulator: '',
        infrastructureMaster: ''
      }
    }

    lines.forEach(line => {
      if (line.includes('Domain:')) {
        info.name = line.split('Domain:')[1]?.trim() || ''
      } else if (line.includes('Netbios domain:')) {
        info.netbiosName = line.split('Netbios domain:')[1]?.trim() || ''
      } else if (line.includes('Realm:')) {
        info.realm = line.split('Realm:')[1]?.trim() || ''
      } else if (line.includes('DNS root:')) {
        info.dnsRoot = line.split('DNS root:')[1]?.trim() || ''
      } else if (line.includes('Forest function level:')) {
        info.forestFunctionLevel = line.split('Forest function level:')[1]?.trim() || ''
      } else if (line.includes('Domain function level:')) {
        info.domainFunctionLevel = line.split('Domain function level:')[1]?.trim() || ''
      } else if (line.includes('Schema version:')) {
        info.schemaVersion = line.split('Schema version:')[1]?.trim() || ''
      } else if (line.includes('Domain SID:')) {
        info.domainSid = line.split('Domain SID:')[1]?.trim() || ''
      }
    })

    return info
  }

  private static parseBackupInfo (output: string, type: 'offline' | 'online'): BackupInfo {
    return {
      id: `backup-${Date.now()}`,
      type: type === 'offline' ? 'Offline' : 'Online',
      path: output.includes('backup saved to') ? output.split('backup saved to')[1]?.trim() : '',
      timestamp: new Date(),
      size: 0, // Would need additional parsing to get actual size
      status: 'Success'
    }
  }

  private static parseTrustList (output: string): TrustRelationship[] {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '')

    return lines.map(line => ({
      name: line.trim(),
      type: 'External', // Default, would need more detailed parsing
      direction: 'Bidirectional', // Default, would need more detailed parsing
      status: 'Active',
      createdAt: new Date()
    }))
  }

  private static parseTrustInfo (output: string, domain: string): TrustRelationship {
    const trust: TrustRelationship = {
      name: domain,
      type: 'External',
      direction: 'Bidirectional',
      status: 'Active',
      createdAt: new Date()
    }

    // Parse additional details from output if available
    const lines = output.trim().split('\n')
    lines.forEach(line => {
      if (line.includes('Type:')) {
        const typeValue = line.split('Type:')[1]?.trim().toLowerCase()
        if (typeValue === 'forest') trust.type = 'Forest'
        else if (typeValue === 'external') trust.type = 'External'
        else if (typeValue === 'realm') trust.type = 'Realm'
      } else if (line.includes('Direction:')) {
        const directionValue = line.split('Direction:')[1]?.trim().toLowerCase()
        if (directionValue === 'inbound') trust.direction = 'Incoming'
        else if (directionValue === 'outbound') trust.direction = 'Outgoing'
        else if (directionValue === 'bidirectional') trust.direction = 'Bidirectional'
      }
    })

    return trust
  }

  private static parseTrustValidation (output: string): { valid: boolean; message: string } {
    const isValid = !output.toLowerCase().includes('error') && !output.toLowerCase().includes('failed')
    return {
      valid: isValid,
      message: output.trim()
    }
  }
}
