// User API Service

import { BaseAPI } from './base-api'
import { APIError, SambaErrorParser } from '@/lib/errors'
import type {
  SambaUser,
  CreateUserInput,
  UpdateUserInput,
  FilterOptions
} from '@/types/samba'

export class UserAPI extends BaseAPI {
  /**
   * List all users with optional filtering
   */
  static async list (filters?: FilterOptions): Promise<SambaUser[]> {
    try {
      const command = ['samba-tool', 'user', 'list']

      // Add search filter if provided
      if (filters?.search) {
        // Use LDAP filter for search
        command.push('--filter', `(|(cn=*${filters.search}*)(sAMAccountName=*${filters.search}*)(mail=*${filters.search}*))`)
      }

      const output = await this.executeCommand(command)

      // Parse user list and get detailed info for each user
      const usernames = this.parseSimpleList(output)

      // Get detailed information for each user
      const users = await Promise.all(
        usernames.map(username => this.show(username).catch(() => null))
      )

      // Filter out failed user lookups and apply additional filters
      let filteredUsers = users.filter((user): user is SambaUser => user !== null)

      if (filters?.enabled !== undefined) {
        filteredUsers = filteredUsers.filter(user => user.enabled === filters.enabled)
      }

      if (filters?.organizationalUnit) {
        filteredUsers = filteredUsers.filter(user =>
          user.organizationalUnit === filters.organizationalUnit
        )
      }

      if (filters?.groups?.length) {
        filteredUsers = filteredUsers.filter(user =>
          filters.groups?.some(group => user.groups.includes(group))
        )
      }

      if (filters?.dateFrom || filters?.dateTo) {
        filteredUsers = filteredUsers.filter(user => {
          if (filters.dateFrom && user.createdAt < filters.dateFrom) return false
          if (filters.dateTo && user.createdAt > filters.dateTo) return false
          return true
        })
      }

      return filteredUsers
    } catch (error) {
      throw new APIError('Failed to list users', 'USER_LIST_ERROR', error)
    }
  }

  /**
   * Get detailed information about a specific user
   */
  static async show (username: string): Promise<SambaUser> {
    this.validateRequired({ username }, ['username'])

    try {
      const command = ['samba-tool', 'user', 'show', username]
      const output = await this.executeCommand(command)

      return this.parseUserDetails(output, username)
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `show user ${username}`
      )
    }
  }

  /**
   * Create a new user
   */
  static async create (userData: CreateUserInput): Promise<SambaUser> {
    this.validateRequired(userData as unknown as Record<string, unknown>, ['username', 'password'])

    try {
      const command = this.buildCreateCommand(userData)
      await this.executeCommand(command)

      // Return the created user details
      return await this.show(userData.username)
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `create user ${userData.username}`
      )
    }
  }

  /**
   * Update user information
   */
  static async update (userData: UpdateUserInput): Promise<SambaUser> {
    this.validateRequired(userData as unknown as Record<string, unknown>, ['username'])

    try {
      // Build update commands
      const commands = this.buildUpdateCommands(userData)

      // Execute all update commands
      for (const command of commands) {
        await this.executeCommand(command)
      }

      // Return updated user details
      return await this.show(userData.username)
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `update user ${userData.username}`
      )
    }
  }

  /**
   * Delete a user
   */
  static async delete (username: string): Promise<void> {
    this.validateRequired({ username }, ['username'])

    try {
      const command = ['samba-tool', 'user', 'delete', username]
      await this.executeCommand(command)
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `delete user ${username}`
      )
    }
  }

  /**
   * Enable a user account
   */
  static async enable (username: string): Promise<SambaUser> {
    this.validateRequired({ username }, ['username'])

    try {
      const command = ['samba-tool', 'user', 'enable', username]
      await this.executeCommand(command)

      return await this.show(username)
    } catch (error) {
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `enable user ${username}`
      )
    }
  }

  /**
   * Disable a user account
   */
  static async disable (username: string): Promise<SambaUser> {
    this.validateRequired({ username }, ['username'])

    try {
      const command = ['samba-tool', 'user', 'disable', username]
      await this.executeCommand(command)

      return await this.show(username)
    } catch (error) {
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `disable user ${username}`
      )
    }
  }

  /**
   * Set user password
   */
  static async setPassword (username: string, password: string): Promise<void> {
    this.validateRequired({ username, password }, ['username', 'password'])

    try {
      const command = ['samba-tool', 'user', 'setpassword', username]
      await this.executeCommand(command, { input: password })
    } catch (error) {
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `set password for user ${username}`
      )
    }
  }

  /**
   * Set password expiry
   */
  static async setExpiry (username: string, expiry?: Date): Promise<SambaUser> {
    this.validateRequired({ username }, ['username'])

    try {
      const command = ['samba-tool', 'user', 'setexpiry', username]

      if (expiry) {
        command.push('--days', Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)).toString())
      } else {
        command.push('--noexpiry')
      }

      await this.executeCommand(command)
      return await this.show(username)
    } catch (error) {
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `set expiry for user ${username}`
      )
    }
  }

  /**
   * Move user to different OU
   */
  static async move (username: string, targetOU: string): Promise<SambaUser> {
    this.validateRequired({ username, targetOU }, ['username', 'targetOU'])

    try {
      const command = ['samba-tool', 'user', 'move', username, targetOU]
      await this.executeCommand(command)

      return await this.show(username)
    } catch (error) {
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `move user ${username} to ${targetOU}`
      )
    }
  }

  /**
   * Get user groups
   */
  static async getGroups (username: string): Promise<string[]> {
    this.validateRequired({ username }, ['username'])

    try {
      const command = ['samba-tool', 'user', 'listmembers', username]
      const output = await this.executeCommand(command)

      return this.parseSimpleList(output)
    } catch (error) {
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `get groups for user ${username}`
      )
    }
  }

  /**
   * Add user to groups
   */
  static async addToGroups (username: string, groups: string[]): Promise<void> {
    this.validateRequired({ username, groups }, ['username', 'groups'])

    try {
      for (const group of groups) {
        const command = ['samba-tool', 'group', 'addmembers', group, username]
        await this.executeCommand(command)
      }
    } catch (error) {
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `add user ${username} to groups`
      )
    }
  }

  /**
   * Remove user from groups
   */
  static async removeFromGroups (username: string, groups: string[]): Promise<void> {
    this.validateRequired({ username, groups }, ['username', 'groups'])

    try {
      for (const group of groups) {
        const command = ['samba-tool', 'group', 'removemembers', group, username]
        await this.executeCommand(command)
      }
    } catch (error) {
      throw SambaErrorParser.parseError(
        error instanceof Error ? error.message : String(error),
        `remove user ${username} from groups`
      )
    }
  }

  // Private helper methods

  private static buildCreateCommand (userData: CreateUserInput): string[] {
    const command = ['samba-tool', 'user', 'create', userData.username, userData.password]

    if (userData.firstName) {
      command.push('--given-name', userData.firstName)
    }

    if (userData.lastName) {
      command.push('--surname', userData.lastName)
    }

    if (userData.displayName) {
      command.push('--full-name', userData.displayName)
    }

    if (userData.email) {
      command.push('--mail-address', userData.email)
    }

    if (userData.description) {
      command.push('--description', userData.description)
    }

    if (userData.organizationalUnit) {
      command.push('--userou', userData.organizationalUnit)
    }

    if (userData.mustChangePassword) {
      command.push('--must-change-at-next-login')
    }

    if (userData.passwordNeverExpires) {
      command.push('--password-never-expires')
    }

    return command
  }

  private static buildUpdateCommands (userData: UpdateUserInput): string[][] {
    const commands: string[][] = []
    const username = userData.username

    if (userData.email !== undefined) {
      commands.push(['samba-tool', 'user', 'setmail', username, userData.email || ''])
    }

    if (userData.displayName !== undefined) {
      commands.push(['samba-tool', 'user', 'setprimarygroup', username, userData.displayName])
    }

    if (userData.enabled !== undefined) {
      const action = userData.enabled ? 'enable' : 'disable'
      commands.push(['samba-tool', 'user', action, username])
    }

    return commands
  }

  private static parseUserDetails (output: string, username: string): SambaUser {
    const lines = output.split('\n')
    const user: Partial<SambaUser> = {
      username,
      enabled: true,
      groups: [],
      createdAt: new Date()
    }

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':')
      const value = valueParts.join(':').trim()

      if (!key || !value) return

      const normalizedKey = key.trim().toLowerCase()

      switch (normalizedKey) {
        case 'displayname':
          user.displayName = value
          break
        case 'givenname':
          user.firstName = value
          break
        case 'sn':
          user.lastName = value
          break
        case 'mail':
          user.email = value
          break
        case 'description':
          user.description = value
          break
        case 'useraccountcontrol': {
          // Parse account control flags
          const flags = parseInt(value)
          user.enabled = !(flags & 0x0002) // ACCOUNTDISABLE flag
          break
        }
        case 'whencreated':
          user.createdAt = this.parseDate(value) || new Date()
          break
        case 'lastlogon':
          user.lastLogin = this.parseDate(value)
          break
        case 'memberof':
          // Parse group memberships
          if (value) {
            user.groups = value.split(',').map(group => group.trim())
          }
          break
      }
    })

    return user as SambaUser
  }
}
