// Base API Service Layer

import cockpit from 'cockpit'
import { APIError, SambaErrorParser, RetryHandler, type RetryOptions } from '@/lib/errors'

export interface CommandOptions {
  superuser?: boolean;
  timeout?: number;
  input?: string;
  env?: Record<string, string>;
  retry?: RetryOptions;
}

export interface ParseOptions<T> {
  parser: (line: string) => T | null;
  filter?: (item: T) => boolean;
  transform?: (items: T[]) => T[];
}

export abstract class BaseAPI {
  protected static readonly DEFAULT_TIMEOUT = 30000 // 30 seconds
  protected static readonly DEFAULT_COMMAND_OPTIONS: CommandOptions = {
    superuser: true,
    timeout: BaseAPI.DEFAULT_TIMEOUT
  }

  /**
   * Execute a samba-tool command with error handling and retry logic
   */
  protected static async executeCommand (
    command: string[],
    options: CommandOptions = {}
  ): Promise<string> {
    const finalOptions = { ...this.DEFAULT_COMMAND_OPTIONS, ...options }
    const { retry, ...cockpitOptions } = finalOptions

    // Sanitize command arguments
    const sanitizedCommand = this.sanitizeCommand(command)

    const operation = async (): Promise<string> => {
      try {
        const result = await cockpit.spawn(sanitizedCommand, {
          err: 'message',
          ...cockpitOptions
        })

        return result || ''
      } catch (error: any) {
        throw SambaErrorParser.parseError(
          error.message || error.toString(),
          command.join(' ')
        )
      }
    }

    if (retry) {
      return await RetryHandler.withRetry(operation, retry)
    }

    return await operation()
  }

  /**
   * Sanitize command arguments to prevent injection attacks
   */
  private static sanitizeCommand (command: string[]): string[] {
    return command.map(arg => {
      // Remove potentially dangerous characters
      const sanitized = arg.replace(/[;&|`$(){}[\]<>]/g, '')

      // Limit argument length
      if (sanitized.length > 1000) {
        throw new APIError('Command argument too long', 'INVALID_INPUT')
      }

      return sanitized
    })
  }

  /**
   * Parse command output into structured data
   */
  protected static parseOutput<T> (
    output: string,
    options: ParseOptions<T>
  ): T[] {
    const { parser, filter, transform } = options

    const lines = output.split('\n').filter(line => line.trim())
    let items = lines
      .map(parser)
      .filter((item): item is T => item !== null)

    if (filter) {
      items = items.filter(filter)
    }

    if (transform) {
      items = transform(items)
    }

    return items
  }

  /**
   * Build samba-tool command with consistent structure
   */
  protected static buildCommand (
    tool: string,
    action: string,
    args: string[] = [],
    options: Record<string, string | boolean> = {}
  ): string[] {
    const command = ['samba-tool', tool, action, ...args]

    // Add options as flags
    Object.entries(options).forEach(([key, value]) => {
      if (value === true) {
        command.push(`--${key}`)
      } else if (typeof value === 'string' && value) {
        command.push(`--${key}`, value)
      }
    })

    return command
  }

  /**
   * Parse tabulated output (common samba-tool format)
   */
  protected static parseTabulated<T> (
    output: string,
    headers: string[],
    mapper: (row: Record<string, string>) => T
  ): T[] {
    const lines = output.trim().split('\n')

    if (lines.length <= 1) {
      return []
    }

    // Skip header line if present
    const dataLines = lines.slice(1)

    return dataLines.map(line => {
      const values = line.split('\t').map(v => v.trim())
      const row: Record<string, string> = {}

      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      return mapper(row)
    }).filter(Boolean)
  }

  /**
   * Parse simple list output (one item per line)
   */
  protected static parseSimpleList (
    output: string,
    transform?: (item: string) => string
  ): string[] {
    return output
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(transform || (x => x))
  }

  /**
   * Validate required fields
   */
  protected static validateRequired (
    data: Record<string, unknown>,
    requiredFields: string[]
  ): void {
    const missingFields = requiredFields.filter(
      field => !data[field] || (typeof data[field] === 'string' && !data[field].toString().trim())
    )

    if (missingFields.length > 0) {
      throw new APIError(
        `Missing required fields: ${missingFields.join(', ')}`,
        'VALIDATION_ERROR',
        { missingFields }
      )
    }
  }

  /**
   * Format date for samba-tool commands
   */
  protected static formatDate (date: Date): string {
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  /**
   * Parse samba date format
   */
  protected static parseDate (dateString: string): Date | undefined {
    if (!dateString || dateString === 'never' || dateString === '0') {
      return undefined
    }

    const parsed = new Date(dateString)
    return isNaN(parsed.getTime()) ? undefined : parsed
  }

  /**
   * Check if a command exists and is executable
   */
  protected static async validateCommand (command: string): Promise<boolean> {
    try {
      await cockpit.spawn(['which', command])
      return true
    } catch {
      return false
    }
  }

  /**
   * Get samba-tool version information
   */
  static async getVersion (): Promise<{ version: string; features: string[] }> {
    try {
      const output = await this.executeCommand(['samba-tool', '--version'])
      const lines = output.split('\n')

      const versionLine = lines[0]
      const version = versionLine.match(/(\d+\.\d+\.\d+)/)?.[1] || 'unknown'

      const features = lines
        .slice(1)
        .filter(line => line.includes('HAVE_'))
        .map(line => line.trim())

      return { version, features }
    } catch (error) {
      throw new APIError('Failed to get Samba version', 'VERSION_ERROR', error)
    }
  }

  /**
   * Test connection to domain controller
   */
  static async testConnection (): Promise<boolean> {
    try {
      await this.executeCommand(['samba-tool', 'domain', 'info', '127.0.0.1'], {
        timeout: 5000 // Short timeout for connection test
      })
      return true
    } catch {
      return false
    }
  }
}

// Utility functions for common operations
export class APIUtils {
  /**
   * Escape special characters in LDAP queries
   */
  static escapeLDAP (input: string): string {
    return input
      .replace(/\\/g, '\\\\')
      .replace(/\*/g, '\\*')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\0/g, '\\00')
  }

  /**
   * Generate a secure random password
   */
  static generatePassword (
    length: number = 12,
    includeSymbols: boolean = true
  ): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = includeSymbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : ''

    const allChars = lowercase + uppercase + numbers + symbols
    let password = ''

    // Ensure at least one character from each category
    password += this.randomChar(lowercase)
    password += this.randomChar(uppercase)
    password += this.randomChar(numbers)
    if (includeSymbols) {
      password += this.randomChar(symbols)
    }

    // Fill remaining length
    for (let i = password.length; i < length; i++) {
      password += this.randomChar(allChars)
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  private static randomChar (chars: string): string {
    return chars[Math.floor(Math.random() * chars.length)]
  }

  /**
   * Validate email address format
   */
  static isValidEmail (email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate username format for Active Directory
   */
  static isValidUsername (username: string): boolean {
    // AD username rules: 1-64 chars, alphanumeric + some special chars, no spaces
    const usernameRegex = /^[a-zA-Z0-9._-]{1,64}$/
    return usernameRegex.test(username)
  }

  /**
   * Validate computer name format
   */
  static isValidComputerName (name: string): boolean {
    // NetBIOS name rules: 1-15 chars, alphanumeric + hyphen, no spaces
    const computerNameRegex = /^[a-zA-Z0-9-]{1,15}$/
    return computerNameRegex.test(name) && !name.startsWith('-') && !name.endsWith('-')
  }

  /**
   * Parse distinguished name components
   */
  static parseDN (dn: string): Record<string, string[]> {
    const components: Record<string, string[]> = {}
    const parts = dn.split(',').map(part => part.trim())

    parts.forEach(part => {
      const [key, ...valueParts] = part.split('=')
      const value = valueParts.join('=').trim()

      if (key && value) {
        const normalizedKey = key.trim().toLowerCase()
        if (!components[normalizedKey]) {
          components[normalizedKey] = []
        }
        components[normalizedKey].push(value)
      }
    })

    return components
  }
}
