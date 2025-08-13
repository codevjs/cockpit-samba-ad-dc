import { BaseAPI } from './base-api'
import {
  DNSRecord,
  DNSServerInfo,
  DNSZoneInfo,
  CreateDNSRecordInput,
  DeleteDNSRecordInput,
  CreateDNSZoneInput,
  DeleteDNSZoneInput,
  DNSCleanupInput
} from '../types/samba'
import { APIError } from '../lib/errors'

export class DNSAPI extends BaseAPI {
  /**
   * Create a DNS record
   */
  static async createRecord (input: CreateDNSRecordInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['server', 'zone', 'name', 'type', 'data'])

    try {
      const command = ['samba-tool', 'dns', 'add', input.server, input.zone, input.name, input.type, input.data]

      if (input.password) {
        command.push(`--password=${input.password}`)
      }

      await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to create DNS record: ${(error as Error).message}`,
        'DNS_CREATE_RECORD_FAILED',
        error
      )
    }
  }

  /**
   * Delete a DNS record
   */
  static async deleteRecord (input: DeleteDNSRecordInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['server', 'zone', 'name', 'type', 'data'])

    try {
      const command = ['samba-tool', 'dns', 'delete', input.server, input.zone, input.name, input.type, input.data]

      if (input.password) {
        command.push(`--password=${input.password}`)
      }

      await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to delete DNS record: ${(error as Error).message}`,
        'DNS_DELETE_RECORD_FAILED',
        error
      )
    }
  }

  /**
   * Create a DNS zone
   */
  static async createZone (input: CreateDNSZoneInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['server', 'zoneName'])

    try {
      const command = ['samba-tool', 'dns', 'zonecreate', input.server, input.zoneName]

      if (input.password) {
        command.push(`--password=${input.password}`)
      }

      await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to create DNS zone: ${(error as Error).message}`,
        'DNS_CREATE_ZONE_FAILED',
        error
      )
    }
  }

  /**
   * Delete a DNS zone
   */
  static async deleteZone (input: DeleteDNSZoneInput): Promise<void> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['server', 'zoneName'])

    try {
      const command = ['samba-tool', 'dns', 'zonedelete', input.server, input.zoneName]

      if (input.password) {
        command.push(`--password=${input.password}`)
      }

      await this.executeCommand(command)
    } catch (error) {
      throw new APIError(
        `Failed to delete DNS zone: ${(error as Error).message}`,
        'DNS_DELETE_ZONE_FAILED',
        error
      )
    }
  }

  /**
   * List DNS zones
   */
  static async listZones (server: string, password?: string): Promise<string[]> {
    this.validateRequired({ server }, ['server'])

    try {
      const command = ['samba-tool', 'dns', 'zonelist', server]

      if (password) {
        command.push(`--password=${password}`)
      }

      const output = await this.executeCommand(command)
      return this.parseZoneList(output)
    } catch (error) {
      throw new APIError(
        `Failed to list DNS zones: ${(error as Error).message}`,
        'DNS_LIST_ZONES_FAILED',
        error
      )
    }
  }

  /**
   * Get DNS zone information
   */
  static async getZoneInfo (server: string, zoneName: string, password?: string): Promise<DNSZoneInfo> {
    this.validateRequired({ server, zoneName }, ['server', 'zoneName'])

    try {
      const command = ['samba-tool', 'dns', 'zoneinfo', server, zoneName]

      if (password) {
        command.push(`--password=${password}`)
      }

      const output = await this.executeCommand(command)
      return this.parseZoneInfo(output, server, zoneName)
    } catch (error) {
      throw new APIError(
        `Failed to get DNS zone info: ${(error as Error).message}`,
        'DNS_ZONE_INFO_FAILED',
        error
      )
    }
  }

  /**
   * Get DNS server information
   */
  static async getServerInfo (server: string, password?: string): Promise<DNSServerInfo> {
    this.validateRequired({ server }, ['server'])

    try {
      const command = ['samba-tool', 'dns', 'serverinfo', server]

      if (password) {
        command.push(`--password=${password}`)
      }

      const output = await this.executeCommand(command)
      return this.parseServerInfo(output, server)
    } catch (error) {
      throw new APIError(
        `Failed to get DNS server info: ${(error as Error).message}`,
        'DNS_SERVER_INFO_FAILED',
        error
      )
    }
  }

  /**
   * Cleanup DNS records
   */
  static async cleanup (input: DNSCleanupInput): Promise<string[]> {
    this.validateRequired(input as unknown as Record<string, unknown>, ['server'])

    try {
      const command = ['samba-tool', 'dns', 'cleanup', input.server]

      if (input.password) {
        command.push(`--password=${input.password}`)
      }

      const output = await this.executeCommand(command)
      return output.split('\n').filter(line => line.trim() !== '')
    } catch (error) {
      throw new APIError(
        `Failed to cleanup DNS: ${(error as Error).message}`,
        'DNS_CLEANUP_FAILED',
        error
      )
    }
  }

  /**
   * Parse zone list output
   */
  private static parseZoneList (output: string): string[] {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '')
    return lines.map(line => line.trim())
  }

  /**
   * Parse zone info output
   */
  private static parseZoneInfo (output: string, server: string, zoneName: string): DNSZoneInfo {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '')
    const records: DNSRecord[] = []

    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (this.isDNSRecord(trimmedLine)) {
        const record = this.parseDNSRecord(trimmedLine)
        if (record) {
          records.push(record)
        }
      }
    })

    return {
      zoneName,
      server,
      records,
      rawOutput: lines
    }
  }

  /**
   * Parse server info output
   */
  private static parseServerInfo (output: string, server: string): DNSServerInfo {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '')
    let version = 'Unknown'
    let status: 'Running' | 'Stopped' | 'Unknown' = 'Unknown'
    const zones: string[] = []

    lines.forEach(line => {
      const trimmedLine = line.trim().toLowerCase()

      if (trimmedLine.includes('version')) {
        const versionMatch = line.match(/version[:\s]+([^\s]+)/i)
        if (versionMatch) {
          version = versionMatch[1]
        }
      }

      if (trimmedLine.includes('running') || trimmedLine.includes('active')) {
        status = 'Running'
      } else if (trimmedLine.includes('stopped') || trimmedLine.includes('inactive')) {
        status = 'Stopped'
      }

      // Extract zone names if listed
      if (trimmedLine.includes('zone') && !trimmedLine.includes('zones:')) {
        const zoneMatch = line.match(/zone[:\s]+([^\s]+)/i)
        if (zoneMatch) {
          zones.push(zoneMatch[1])
        }
      }
    })

    return {
      serverName: server,
      version,
      zones,
      status,
      rawOutput: lines
    }
  }

  /**
   * Check if line contains a DNS record
   */
  private static isDNSRecord (line: string): boolean {
    const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT']
    return recordTypes.some(type => line.includes(type))
  }

  /**
   * Parse a DNS record from output line
   */
  private static parseDNSRecord (line: string): DNSRecord | null {
    // Simple parsing - in real implementation would need more sophisticated DNS record parsing
    const parts = line.trim().split(/\s+/)
    if (parts.length >= 3) {
      const name = parts[0]
      const type = parts[1] as DNSRecord['type']
      const data = parts.slice(2).join(' ')

      if (['A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT'].includes(type)) {
        return {
          name,
          type,
          data,
          ttl: 3600 // Default TTL
        }
      }
    }
    return null
  }
}
