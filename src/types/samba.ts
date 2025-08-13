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

export interface CreateComputerInput extends Record<string, unknown> {
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
  sid?: string;
  memberCount?: number;
}

export interface CreateGroupInput {
  name: string;
  displayName?: string;
  description?: string;
  groupType: 'Security' | 'Distribution';
  groupScope?: 'DomainLocal' | 'Global' | 'Universal';
  organizationalUnit?: string;
}

export interface UpdateGroupInput extends Partial<Omit<CreateGroupInput, 'name'>> {
  name: string;
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

export interface UpdateGPOInput {
  name: string;
  displayName?: string;
  description?: string;
}

export interface DeleteGPOInput {
  name: string;
}

export interface BackupGPOInput {
  name: string;
  backupPath: string;
}

export interface RestoreGPOInput {
  name: string;
  backupPath: string;
  newName?: string;
}

export interface FetchGPOInput {
  name: string;
  targetPath: string;
}

export interface GPOLink {
  containerDN: string;
  linkOptions: string;
  order: number;
  gpoName: string;
}

export interface SetGPOLinkInput {
  containerDN: string;
  gpoName: string;
  linkOptions?: string;
  order?: number;
}

export interface DeleteGPOLinkInput {
  containerDN: string;
  gpoName: string;
}

export interface GPOInheritance {
  containerDN: string;
  inheritance: 'Enabled' | 'Disabled';
}

export interface SetGPOInheritanceInput {
  containerDN: string;
  inheritance: 'Enabled' | 'Disabled';
}

export interface GPOContainer {
  distinguishedName: string;
  name: string;
  description?: string;
  type: 'OU' | 'Domain' | 'Site';
}

// Domain Management Types
export interface DomainInfo {
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

export interface DomainJoinInput {
  domain: string;
  username: string;
  password: string;
  organizationalUnit?: string;
  computerName?: string;
}

export interface TrustRelationship {
  name: string;
  type: 'External' | 'Forest' | 'Realm';
  direction: 'Incoming' | 'Outgoing' | 'Bidirectional';
  status: 'Active' | 'Inactive' | 'Broken';
  createdAt: Date;
}

export interface CreateTrustInput {
  trustDomain: string;
  trustPassword: string;
  trustType: 'External' | 'Forest' | 'Realm';
  trustDirection: 'Incoming' | 'Outgoing' | 'Bidirectional';
}

// Backup Types
export interface BackupInfo {
  id: string;
  type: 'Online' | 'Offline';
  path: string;
  timestamp: Date;
  size: number;
  status: 'Success' | 'Failed' | 'InProgress';
}

export interface BackupOfflineInput {
  targetdir: string;
  server?: string;
  realm?: string;
}

export interface BackupOnlineInput {
  targetdir: string;
  server?: string;
}

export interface BackupRenameInput {
  oldname: string;
  newname: string;
}

export interface BackupRestoreInput {
  backup: string;
  targetdir: string;
  newbasedn?: string;
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

// Contact Management Types
export interface SambaContact {
  name: string;
  givenName?: string;
  initials?: string;
  surname?: string;
  displayName?: string;
  distinguishedName: string;
  description?: string;
  mail?: string;
  telephoneNumber?: string;
  createdAt: Date;
  organizationalUnit?: string;
}

export interface CreateContactInput {
  givenName: string;
  initials?: string;
  surname: string;
  displayName?: string;
  description?: string;
  mail?: string;
  telephoneNumber?: string;
  organizationalUnit?: string;
}

export interface UpdateContactInput extends Partial<Omit<CreateContactInput, 'givenName' | 'surname'>> {
  name: string;
  givenName?: string;
  surname?: string;
}

// SPN Management Types
export interface SambaSPN {
  name: string;
  user: string;
  serviceName: string;
  hostName?: string;
  port?: number;
  createdAt: Date;
}

export interface CreateSPNInput {
  name: string;
  user: string;
}

export interface DeleteSPNInput {
  name: string;
  user: string;
}

// FSMO (Flexible Single Master Operations) Types
export interface FSMORole {
  role: 'SchemaMaster' | 'DomainNamingMaster' | 'PDCEmulator' | 'RIDMaster' | 'InfrastructureMaster';
  holder: string;
  description: string;
}

export interface FSMORoles {
  schemaMaster: string;
  domainNamingMaster: string;
  ridMaster: string;
  pdcEmulator: string;
  infrastructureMaster: string;
}

export interface TransferFSMORoleInput {
  role: 'SchemaMaster' | 'DomainNamingMaster' | 'PDCEmulator' | 'RIDMaster' | 'InfrastructureMaster';
  targetServer: string;
}

export interface SeizeFSMORoleInput {
  role: 'SchemaMaster' | 'DomainNamingMaster' | 'PDCEmulator' | 'RIDMaster' | 'InfrastructureMaster';
}

// Sites and Subnets Management Types
export interface SambaSite {
  name: string;
  description?: string;
  subnets: string[];
  servers: string[];
  createdAt: Date;
}

export interface SambaSubnet {
  name: string;
  site: string;
  description?: string;
  createdAt: Date;
}

export interface CreateSiteInput {
  name: string;
  description?: string;
}

export interface CreateSubnetInput {
  subnet: string;
  site: string;
  description?: string;
}

export interface SetSiteInput {
  server: string;
  site: string;
}

// Forest Management Types
export interface SambaForest {
  name: string;
  domainName: string;
  forestFunctionLevel: string;
  domainFunctionLevel: string;
  schemaVersion: string;
  directoryServiceSettings: string[];
  dsheuristics?: string;
  createdAt: Date;
}

export interface ForestDirectoryServiceInfo {
  name: string;
  value: string;
  description?: string;
}

export interface SetDSHeuristicsInput {
  value: string;
}

// Organization Unit Management Types
export interface SambaOU {
  name: string;
  distinguishedName: string;
  description?: string;
  parentOU?: string;
  children: SambaOUChild[];
  objects: SambaOUObject[];
  createdAt: Date;
}

export interface SambaOUChild {
  name: string;
  distinguishedName: string;
  type: 'OU';
}

export interface SambaOUObject {
  name: string;
  distinguishedName: string;
  type: 'User' | 'Computer' | 'Group' | 'Contact';
  enabled?: boolean;
}

export interface CreateOUInput {
  name: string;
  description?: string;
  parentOU?: string;
}

export interface UpdateOUInput {
  distinguishedName: string;
  description?: string;
}

export interface MoveOUInput {
  ouDN: string;
  targetParentDN: string;
}

export interface RenameOUInput {
  ouDN: string;
  newName: string;
}

// Directory Service ACL Management Types
export interface DSACLEntry {
  id: string;
  objectDN: string;
  trusteeDN: string;
  permissions: string[];
  accessType: 'Allow' | 'Deny';
  inheritanceFlags: string[];
  sddl: string;
}

export interface DSACLInfo {
  objectDN: string;
  entries: DSACLEntry[];
  rawOutput: string[];
}

export interface SetDSACLInput {
  url?: string;
  car?: string;
  action?: string;
  objectDN?: string;
  trusteeDN?: string;
  sddl?: string;
}

// NT ACL Management Types
export interface NTACLInfo {
  filePath: string;
  acl: string;
  permissions: NTACLPermission[];
  rawOutput: string[];
}

export interface NTACLPermission {
  trustee: string;
  permissions: string[];
  accessType: 'Allow' | 'Deny';
  inheritance: string[];
}

export interface GetNTACLInput {
  file: string;
  xattrBackend?: string;
  eadbFile?: string;
  useNtvfs?: string;
  useS3fs?: string;
  service?: string;
}

export interface SetNTACLInput {
  acl: string;
  file: string;
  xattrBackend?: string;
  eadbFile?: string;
  useNtvfs?: string;
  useS3fs?: string;
  service?: string;
}

export interface ChangeDomSIDInput {
  oldSid: string;
  newSid: string;
  xattrBackend?: string;
  eadbFile?: string;
  useNtvfs?: string;
  useS3fs?: string;
  service?: string;
}

export interface SysvolOperationInput {
  xattrBackend?: string;
  eadbFile?: string;
  useNtvfs?: string;
  useS3fs?: string;
  service?: string;
}

export interface DOSInfo {
  filePath: string;
  attributes: string[];
  rawOutput: string[];
}

// Delegation Management Types
export interface DelegationInfo {
  accountName: string;
  delegationType: 'Constrained' | 'Unconstrained' | 'ResourceBased';
  allowedServices: string[];
  protocols: string[];
  anyService: boolean;
  anyProtocol: boolean;
  rawOutput: string[];
}

export interface AddServiceDelegationInput {
  accountName: string;
  principal: string;
}

export interface DeleteServiceDelegationInput {
  accountName: string;
  principal: string;
}

export interface SetAnyServiceInput {
  accountName: string;
  enable: boolean;
}

export interface SetAnyProtocolInput {
  accountName: string;
  enable: boolean;
}

// DNS Management Types (Already defined but expanding)
export interface DNSZone {
  name: string;
  type: 'Primary' | 'Secondary' | 'Stub';
  server: string;
  records: DNSRecord[];
  createdAt: Date;
}

export interface DNSServerInfo {
  serverName: string;
  version: string;
  zones: string[];
  status: 'Running' | 'Stopped' | 'Unknown';
  rawOutput: string[];
}

export interface CreateDNSRecordInput {
  server: string;
  zone: string;
  name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'PTR' | 'SOA' | 'SRV' | 'TXT';
  data: string;
  password?: string;
  ttl?: number;
}

export interface DeleteDNSRecordInput {
  server: string;
  zone: string;
  name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'PTR' | 'SOA' | 'SRV' | 'TXT';
  data: string;
  password?: string;
}

export interface CreateDNSZoneInput {
  server: string;
  zoneName: string;
  password?: string;
}

export interface DeleteDNSZoneInput {
  server: string;
  zoneName: string;
  password?: string;
}

export interface DNSZoneInfo {
  zoneName: string;
  server: string;
  records: DNSRecord[];
  rawOutput: string[];
}

export interface DNSCleanupInput {
  server: string;
  password?: string;
}
