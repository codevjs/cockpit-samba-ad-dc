// Computer API Service

import { BaseAPI } from './base-api'
import { APIError, SambaErrorParser } from '@/lib/errors'
import type {
  SambaComputer,
  CreateComputerInput,
  FilterOptions
} from '@/types/samba'

export class ComputerAPI extends BaseAPI {
  /**
   * List all computers with optional filtering
   */
  static async list (filters?: FilterOptions): Promise<SambaComputer[]> {
    try {
      const command = ['samba-tool', 'computer', 'list']

      // Add search filter if provided
      if (filters?.search) {
        // Use LDAP filter for search
        command.push('--filter', `(|(cn=*${filters.search}*)(sAMAccountName=*${filters.search}*)(dNSHostName=*${filters.search}*))`)
      }

      const output = await this.executeCommand(command)

      // Parse computer list and get detailed info for each computer
      const computerNames = this.parseSimpleList(output)

      // Get detailed information for each computer
      const computers = await Promise.all(
        computerNames.map(name => this.show(name).catch(() => null))
      )

      // Filter out failed computer lookups and apply additional filters
      let filteredComputers = computers.filter((computer): computer is SambaComputer => computer !== null)

      if (filters?.enabled !== undefined) {
        filteredComputers = filteredComputers.filter(computer => computer.enabled === filters.enabled)
      }

      if (filters?.organizationalUnit) {
        filteredComputers = filteredComputers.filter(computer =>
          computer.organizationalUnit === filters.organizationalUnit
        )
      }

      if (filters?.dateFrom || filters?.dateTo) {
        filteredComputers = filteredComputers.filter(computer => {
          if (filters.dateFrom && computer.createdAt < filters.dateFrom) return false
          if (filters.dateTo && computer.createdAt > filters.dateTo) return false
          return true
        })
      }

      return filteredComputers
    } catch (error) {
      throw new APIError('Failed to list computers', 'COMPUTER_LIST_ERROR', error)
    }
  }

  /**
   * Get detailed information about a specific computer
   */
  static async show (computerName: string): Promise<SambaComputer> {
    this.validateRequired({ computerName }, ['computerName'])

    try {
      const command = ['samba-tool', 'computer', 'show', computerName]
      const output = await this.executeCommand(command)

      return this.parseComputerDetails(output, computerName)
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `show computer ${computerName}`
      )
    }
  }

  /**
   * Create a new computer account
   */
  static async create (computerData: CreateComputerInput): Promise<SambaComputer> {
    this.validateRequired(computerData, ['name'])

    try {
      const command = this.buildCreateCommand(computerData)
      await this.executeCommand(command)

      // Return the created computer details
      return await this.show(computerData.name)
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `create computer ${computerData.name}`
      )
    }
  }

  /**
   * Delete a computer account
   */
  static async delete (computerName: string): Promise<void> {
    this.validateRequired({ computerName }, ['computerName'])

    try {
      const command = ['samba-tool', 'computer', 'delete', computerName]
      await this.executeCommand(command)
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `delete computer ${computerName}`
      )
    }
  }

  /**
   * Enable a computer account
   */
  static async enable (computerName: string): Promise<SambaComputer> {
    this.validateRequired({ computerName }, ['computerName'])

    try {
      const command = ['samba-tool', 'computer', 'enable', computerName]
      await this.executeCommand(command)

      return await this.show(computerName)
    } catch (error) {
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `enable computer ${computerName}`
      )
    }
  }

  /**
   * Disable a computer account
   */
  static async disable (computerName: string): Promise<SambaComputer> {
    this.validateRequired({ computerName }, ['computerName'])

    try {
      const command = ['samba-tool', 'computer', 'disable', computerName]
      await this.executeCommand(command)

      return await this.show(computerName)
    } catch (error) {
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `disable computer ${computerName}`
      )
    }
  }

  /**
   * Move computer to different OU
   */
  static async move (computerName: string, targetOU: string): Promise<SambaComputer> {
    this.validateRequired({ computerName, targetOU }, ['computerName', 'targetOU'])

    try {
      const command = ['samba-tool', 'computer', 'move', computerName, targetOU]
      await this.executeCommand(command)

      return await this.show(computerName)
    } catch (error) {
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `move computer ${computerName} to ${targetOU}`
      )
    }
  }

  // Private helper methods

  private static buildCreateCommand (computerData: CreateComputerInput): string[] {
    const command = ['samba-tool', 'computer', 'create', computerData.name]

    if (computerData.description) {
      command.push('--description', computerData.description)
    }

    if (computerData.organizationalUnit) {
      command.push('--computerou', computerData.organizationalUnit)
    }

    return command
  }

  private static parseComputerDetails (output: string, computerName: string): SambaComputer {
    const lines = output.split('\n')
    const computer: Partial<SambaComputer> = {
      name: computerName,
      enabled: true,
      createdAt: new Date(),
      distinguishedName: `CN=${computerName},CN=Computers,DC=domain,DC=local`
    }

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':')
      const value = valueParts.join(':').trim()

      if (!key || !value) return

      const normalizedKey = key.trim().toLowerCase()

      switch (normalizedKey) {
        case 'distinguishedname':
          computer.distinguishedName = value
          break
        case 'dnshostname':
          computer.dnsHostName = value
          break
        case 'operatingsystem':
          computer.operatingSystem = value
          break
        case 'operatingsystemversion':
          computer.operatingSystemVersion = value
          break
        case 'description':
          computer.description = value
          break
        case 'useraccountcontrol': {
          // Parse account control flags
          const flags = parseInt(value)
          computer.enabled = !(flags & 0x0002) // ACCOUNTDISABLE flag
          break
        }
        case 'whencreated':
          computer.createdAt = this.parseDate(value) || new Date()
          break
        case 'lastlogon':
          computer.lastLogon = this.parseDate(value)
          break
      }
    })

    // Extract OU from distinguished name
    if (computer.distinguishedName) {
      const ouMatch = computer.distinguishedName.match(/,(?:OU|CN)=(.+?)(?:,DC=|$)/)
      if (ouMatch) {
        computer.organizationalUnit = ouMatch[1]
      }
    }

    return computer as SambaComputer
  }
}
