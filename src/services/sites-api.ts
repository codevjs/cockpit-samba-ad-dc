import { BaseAPI } from './base-api';
import { SambaSite, SambaSubnet, CreateSiteInput, CreateSubnetInput, SetSiteInput } from '../types/samba';
import { APIError } from '../lib/errors';

export class SitesAPI extends BaseAPI {
  /**
   * Create a new site
   */
  static async createSite(siteData: CreateSiteInput): Promise<void> {
    this.validateRequired(siteData as unknown as Record<string, unknown>, ['name']);
    
    try {
      const command = ['samba-tool', 'sites', 'create', siteData.name];
      
      if (siteData.description) {
        command.push('--description', siteData.description);
      }
      
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to create site: ${(error as Error).message}`,
        'SITE_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Remove a site
   */
  static async removeSite(siteName: string): Promise<void> {
    this.validateRequired({ siteName }, ['siteName']);
    
    try {
      const command = ['samba-tool', 'sites', 'remove', siteName];
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to remove site: ${(error as Error).message}`,
        'SITE_REMOVE_FAILED',
        error
      );
    }
  }

  /**
   * Create a new subnet
   */
  static async createSubnet(subnetData: CreateSubnetInput): Promise<void> {
    this.validateRequired(subnetData as unknown as Record<string, unknown>, ['subnet', 'site']);
    
    try {
      const command = ['samba-tool', 'sites', 'subnet', 'create', subnetData.subnet, subnetData.site];
      
      if (subnetData.description) {
        command.push('--description', subnetData.description);
      }
      
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to create subnet: ${(error as Error).message}`,
        'SUBNET_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Remove a subnet
   */
  static async removeSubnet(subnetName: string): Promise<void> {
    this.validateRequired({ subnetName }, ['subnetName']);
    
    try {
      const command = ['samba-tool', 'sites', 'subnet', 'remove', subnetName];
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to remove subnet: ${(error as Error).message}`,
        'SUBNET_REMOVE_FAILED',
        error
      );
    }
  }

  /**
   * Set site for a server
   */
  static async setSite(setSiteData: SetSiteInput): Promise<void> {
    this.validateRequired(setSiteData as unknown as Record<string, unknown>, ['server', 'site']);
    
    try {
      const command = ['samba-tool', 'sites', 'set', setSiteData.server, setSiteData.site];
      await this.executeCommand(command);
    } catch (error) {
      throw new APIError(
        `Failed to set site for server: ${(error as Error).message}`,
        'SITE_SET_FAILED',
        error
      );
    }
  }

  /**
   * List all sites
   */
  static async listSites(): Promise<SambaSite[]> {
    try {
      const output = await this.executeCommand(['samba-tool', 'sites', 'list']);
      return this.parseSitesList(output);
    } catch (error) {
      throw new APIError(
        `Failed to list sites: ${(error as Error).message}`,
        'SITES_LIST_FAILED',
        error
      );
    }
  }

  /**
   * List all subnets
   */
  static async listSubnets(): Promise<SambaSubnet[]> {
    try {
      const output = await this.executeCommand(['samba-tool', 'sites', 'subnet', 'list']);
      return this.parseSubnetsList(output);
    } catch (error) {
      throw new APIError(
        `Failed to list subnets: ${(error as Error).message}`,
        'SUBNETS_LIST_FAILED',
        error
      );
    }
  }

  /**
   * Parse sites list output from samba-tool
   */
  private static parseSitesList(output: string): SambaSite[] {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '');
    
    return lines.map(siteName => ({
      name: siteName.trim(),
      description: '',
      subnets: [],
      servers: [],
      createdAt: new Date()
    }));
  }

  /**
   * Parse subnets list output from samba-tool
   */
  private static parseSubnetsList(output: string): SambaSubnet[] {
    const lines = output.trim().split('\n').filter(line => line.trim() !== '');
    
    return lines.map(line => {
      const trimmedLine = line.trim();
      // Expected format might be "subnet site" or just "subnet"
      const parts = trimmedLine.split(/\s+/);
      const subnetName = parts[0] || trimmedLine;
      const siteName = parts[1] || 'Default-First-Site-Name';
      
      return {
        name: subnetName,
        site: siteName,
        description: '',
        createdAt: new Date()
      };
    });
  }
}