import { BaseAPI } from './base-api'
import { SambaContact, CreateContactInput } from '../types/samba'
import { APIError } from '../lib/errors'

export class ContactAPI extends BaseAPI {
  /**
   * List all contacts
   */
  static async list (): Promise<SambaContact[]> {
    try {
      const output = await this.executeCommand(['samba-tool', 'contact', 'list'])
      return this.parseContactList(output)
    } catch (error) {
      throw new APIError(
        `Failed to fetch contacts: ${(error as Error).message}`,
        'CONTACT_LIST_FAILED',
        error
      )
    }
  }

  /**
   * Get detailed information about a specific contact
   */
  static async show (contactName: string): Promise<SambaContact> {
    try {
      const output = await this.executeCommand(['samba-tool', 'contact', 'show', contactName])
      return this.parseContactDetails(output, contactName)
    } catch (error) {
      throw new APIError(
        `Failed to fetch contact details: ${(error as Error).message}`,
        'CONTACT_SHOW_FAILED',
        error
      )
    }
  }

  /**
   * Create a new contact
   */
  static async create (contactData: CreateContactInput): Promise<SambaContact> {
    try {
      const command = ['samba-tool', 'contact', 'create']

      if (contactData.givenName) {
        command.push('--given-name', contactData.givenName)
      }

      if (contactData.initials) {
        command.push('--initials', contactData.initials)
      }

      if (contactData.surname) {
        command.push('--surname', contactData.surname)
      }

      if (contactData.displayName) {
        command.push('--display-name', contactData.displayName)
      }

      if (contactData.description) {
        command.push('--description', contactData.description)
      }

      if (contactData.mail) {
        command.push('--mail-address', contactData.mail)
      }

      if (contactData.telephoneNumber) {
        command.push('--telephone-number', contactData.telephoneNumber)
      }

      if (contactData.organizationalUnit) {
        command.push('--ou', contactData.organizationalUnit)
      }

      await this.executeCommand(command)

      // Generate contact name from given name and surname
      const contactName = `${contactData.givenName} ${contactData.surname}`.trim()

      // Return the created contact by fetching its details
      return await this.show(contactName)
    } catch (error) {
      throw new APIError(
        `Failed to create contact: ${(error as Error).message}`,
        'CONTACT_CREATE_FAILED',
        error
      )
    }
  }

  /**
   * Delete a contact
   */
  static async delete (contactName: string): Promise<void> {
    try {
      await this.executeCommand(['samba-tool', 'contact', 'delete', contactName])
    } catch (error) {
      throw new APIError(
        `Failed to delete contact: ${(error as Error).message}`,
        'CONTACT_DELETE_FAILED',
        error
      )
    }
  }

  /**
   * Move a contact to a different organizational unit
   */
  static async move (contactName: string, targetOU: string): Promise<SambaContact> {
    try {
      await this.executeCommand([
        'samba-tool', 'contact', 'move',
        contactName,
        targetOU
      ])

      return await this.show(contactName)
    } catch (error) {
      throw new APIError(
        `Failed to move contact: ${(error as Error).message}`,
        'CONTACT_MOVE_FAILED',
        error
      )
    }
  }

  /**
   * Parse contact list output from samba-tool
   */
  private static parseContactList (output: string): SambaContact[] {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '')

    return lines.map(contactName => ({
      name: contactName.trim(),
      displayName: contactName.trim(),
      distinguishedName: `CN=${contactName.trim()},CN=Users,DC=domain,DC=local`,
      createdAt: new Date()
    }))
  }

  /**
   * Parse detailed contact information from samba-tool show output
   */
  private static parseContactDetails (output: string, contactName: string): SambaContact {
    const lines = output.trim().split('\n')
    const contact: SambaContact = {
      name: contactName,
      displayName: contactName,
      distinguishedName: '',
      createdAt: new Date()
    }

    lines.forEach(line => {
      if (line.includes('givenName:')) {
        contact.givenName = line.split('givenName:')[1]?.trim() || ''
      } else if (line.includes('initials:')) {
        contact.initials = line.split('initials:')[1]?.trim() || ''
      } else if (line.includes('sn:')) {
        contact.surname = line.split('sn:')[1]?.trim() || ''
      } else if (line.includes('displayName:')) {
        contact.displayName = line.split('displayName:')[1]?.trim() || ''
      } else if (line.includes('distinguishedName:')) {
        contact.distinguishedName = line.split('distinguishedName:')[1]?.trim() || ''
      } else if (line.includes('description:')) {
        contact.description = line.split('description:')[1]?.trim() || ''
      } else if (line.includes('mail:')) {
        contact.mail = line.split('mail:')[1]?.trim() || ''
      } else if (line.includes('telephoneNumber:')) {
        contact.telephoneNumber = line.split('telephoneNumber:')[1]?.trim() || ''
      }
    })

    return contact
  }
}
