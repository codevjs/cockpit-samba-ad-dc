// Core Samba AD DC Types

export interface SambaUser {
  username: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  description?: string;
  enabled: boolean;
  passwordExpired?: boolean;
  passwordNeverExpires?: boolean;
  mustChangePassword?: boolean;
  accountExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  groups: string[];
  organizationalUnit?: string;
}

export interface CreateUserInput {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  description?: string;
  organizationalUnit?: string;
  groups?: string[];
  mustChangePassword?: boolean;
  passwordNeverExpires?: boolean;
  accountExpires?: Date;
}

export interface UpdateUserInput extends Partial<Omit<CreateUserInput, 'username' | 'password'>> {
  username: string;
  enabled?: boolean;
}

export interface SambaComputer {
  name: string;
  distinguishedName: string;
  dnsHostName?: string;
  operatingSystem?: string;
  operatingSystemVersion?: string;
  enabled: boolean;
  lastLogon?: Date;
  createdAt: Date;
  organizationalUnit?: string;
  description?: string;
}

export interface CreateComputerInput {
  name: string;
  organizationalUnit?: string;
  description?: string;
}

export interface SambaGroup {
  name: string;
  displayName?: string;
  description?: string;
  distinguishedName: string;
  groupType: 'Security' | 'Distribution';
  groupScope: 'DomainLocal' | 'Global' | 'Universal';
  members: string[];
  memberOf: string[];
  createdAt: Date;
  organizationalUnit?: string;
}

export interface CreateGroupInput {
  name: string;
  displayName?: string;
  description?: string;
  groupType: 'Security' | 'Distribution';
  groupScope: 'DomainLocal' | 'Global' | 'Universal';
  organizationalUnit?: string;
}

export interface SambaOrganizationalUnit {
  name: string;
  distinguishedName: string;
  description?: string;
  createdAt: Date;
  parentOU?: string;
  children: string[];
}

export interface CreateOUInput {
  name: string;
  description?: string;
  parentOU?: string;
}

export interface SambaDomain {
  name: string;
  realm: string;
  domainSid: string;
  forestFunctionLevel: string;
  domainFunctionLevel: string;
  schemaVersion: string;
  netbiosName: string;
  dnsRoot: string;
  domainControllers: string[];
  fsmoRoles: FSMORoles;
}

export interface FSMORoles {
  schemaMaster: string;
  domainNamingMaster: string;
  ridMaster: string;
  pdcEmulator: string;
  infrastructureMaster: string;
}

export interface SambaDNSZone {
  name: string;
  type: 'Primary' | 'Secondary' | 'Stub';
  records: DNSRecord[];
  createdAt: Date;
}

export interface DNSRecord {
  name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'PTR' | 'SOA' | 'SRV' | 'TXT';
  data: string;
  ttl?: number;
}

export interface CreateDNSRecordInput {
  zoneName: string;
  name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'PTR' | 'SOA' | 'SRV' | 'TXT';
  data: string;
  ttl?: number;
}

export interface SambaGPO {
  name: string;
  displayName: string;
  guid: string;
  status: 'Enabled' | 'Disabled' | 'UserConfigurationDisabled' | 'ComputerConfigurationDisabled';
  createdAt: Date;
  modifiedAt: Date;
  version: number;
  linkedOUs: string[];
  description?: string;
}

export interface CreateGPOInput {
  name: string;
  displayName: string;
  description?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter and Search Types
export interface FilterOptions {
  search?: string;
  enabled?: boolean;
  organizationalUnit?: string;
  groups?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

// Form Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}