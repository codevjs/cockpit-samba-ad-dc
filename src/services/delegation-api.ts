import { BaseAPI } from './base-api'
import {
  DelegationInfo,
  AddServiceDelegationInput,
  DeleteServiceDelegationInput,
  SetAnyServiceInput,
  SetAnyProtocolInput
} from '../types/samba'
import { APIError } from '../lib/errors'

export class DelegationAPI extends BaseAPI {
  /**
   * Show delegation settings for an account
   */
  static async showDelegation (accountName: string): Promise<DelegationInfo> {
    this.validateRequired({ accountName }, ['accountName'])

    try {
      const command = ['samba-tool', 'delegation', 'show', accountName]
      const output = await this.executeCommand(command)
      return this.parseDelegationInfo(output, accountName)
    } catch (error) {
      throw new APIError(
        `Failed to show delegation: ${(error as Error).message}`,
        'DELEGATION_SHOW_FAILED',
        error
      )
    }
  }

  /**
   * Add a service principal for delegation
   */
  static async addService (input: AddServiceDelegationInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['accountName', 'principal'])

    try {
      const command = ['samba-tool', 'delegation', 'add-service', input.accountName, input.principal]
      await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to add service delegation: ${(error as Error).message}`,
        'DELEGATION_ADD_SERVICE_FAILED',
        error
      )
    }
  }

  /**
   * Delete a service principal from delegation
   */
  static async deleteService (input: DeleteServiceDelegationInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['accountName', 'principal'])

    try {
      const command = ['samba-tool', 'delegation', 'del-service', input.accountName, input.principal]
      await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to delete service delegation: ${(error as Error).message}`,
        'DELEGATION_DELETE_SERVICE_FAILED',
        error
      )
    }
  }

  /**
   * Set any-service delegation
   */
  static async setAnyService (input: SetAnyServiceInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['accountName'])

    try {
      const command = ['samba-tool', 'delegation', 'for-any-service', input.accountName]
      if (!input.enable) {
        command.push('--off')
      }
      await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to set any-service delegation: ${(error as Error).message}`,
        'DELEGATION_ANY_SERVICE_FAILED',
        error
      )
    }
  }

  /**
   * Set any-protocol delegation
   */
  static async setAnyProtocol (input: SetAnyProtocolInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['accountName'])

    try {
      const command = ['samba-tool', 'delegation', 'for-any-protocol', input.accountName]
      if (!input.enable) {
        command.push('--off')
      }
      await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to set any-protocol delegation: ${(error as Error).message}`,
        'DELEGATION_ANY_PROTOCOL_FAILED',
        error
      )
    }
  }

  /**
   * Parse delegation information from output
   */
  private static parseDelegationInfo (output: string, accountName: string): DelegationInfo {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '')
    const allowedServices: string[] = []
    const protocols: string[] = []
    let anyService = false
    let anyProtocol = false
    let delegationType: 'Constrained' | 'Unconstrained' | 'ResourceBased' = 'Constrained'

    lines.forEach(line => {
      const trimmedLine = line.trim().toLowerCase()

      // Check for delegation types
      if (trimmedLine.includes('unconstrained')) {
        delegationType = 'Unconstrained'
      } else if (trimmedLine.includes('resource-based') || trimmedLine.includes('rbcd')) {
        delegationType = 'ResourceBased'
      }

      // Check for any-service
      if (trimmedLine.includes('any service') || trimmedLine.includes('for-any-service')) {
        anyService = true
      }

      // Check for any-protocol
      if (trimmedLine.includes('any protocol') || trimmedLine.includes('for-any-protocol')) {
        anyProtocol = true
      }

      // Extract service principals
      if (trimmedLine.includes('/') && (trimmedLine.includes('host') || trimmedLine.includes('cifs') || trimmedLine.includes('http'))) {
        allowedServices.push(line.trim())
      }

      // Extract protocols
      if (trimmedLine.includes('kerberos') || trimmedLine.includes('ntlm') || trimmedLine.includes('negotiate')) {
        protocols.push(line.trim())
      }
    })

    return {
      accountName,
      delegationType,
      allowedServices,
      protocols,
      anyService,
      anyProtocol,
      rawOutput: lines
    }
  }
}
