import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  Server, 
  Shield,
  Database,
  Clock,
  Info
} from 'lucide-react';
import { useDomainInfo } from './hooks/useDomain';

export function DomainInfoCard() {
  const { domainInfo, loading, error } = useDomainInfo();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Information
          </CardTitle>
          <CardDescription>Loading domain information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Information
          </CardTitle>
          <CardDescription>Error loading domain information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!domainInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Information
          </CardTitle>
          <CardDescription>No domain information available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Info className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Domain information could not be retrieved.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Domain Information
        </CardTitle>
        <CardDescription>
          Active Directory domain configuration details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Domain Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Domain Name</p>
            <p className="text-lg font-semibold">{domainInfo.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">NetBIOS Name</p>
            <p className="text-lg font-semibold">{domainInfo.netbiosName}</p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Realm</p>
            <p className="text-sm">{domainInfo.realm}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">DNS Root</p>
            <p className="text-sm">{domainInfo.dnsRoot}</p>
          </div>
        </div>

        <Separator />

        {/* Function Levels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Forest Function Level</p>
            <Badge variant="outline">{domainInfo.forestFunctionLevel}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Domain Function Level</p>
            <Badge variant="outline">{domainInfo.domainFunctionLevel}</Badge>
          </div>
        </div>

        <Separator />

        {/* Technical Details */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Domain SID</p>
            <p className="font-mono text-xs bg-muted p-2 rounded">{domainInfo.domainSid}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Schema Version</p>
            <p className="text-sm">{domainInfo.schemaVersion}</p>
          </div>
        </div>

        <Separator />

        {/* Domain Controllers */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Domain Controllers</p>
          {domainInfo.domainControllers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No domain controllers listed</p>
          ) : (
            <div className="space-y-2">
              {domainInfo.domainControllers.map((dc, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Server className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{dc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* FSMO Roles */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">FSMO Role Holders</p>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-sm">Schema Master</span>
              <span className="text-sm font-medium">{domainInfo.fsmoRoles.schemaMaster || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-sm">Domain Naming Master</span>
              <span className="text-sm font-medium">{domainInfo.fsmoRoles.domainNamingMaster || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-sm">PDC Emulator</span>
              <span className="text-sm font-medium">{domainInfo.fsmoRoles.pdcEmulator || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-sm">RID Master</span>
              <span className="text-sm font-medium">{domainInfo.fsmoRoles.ridMaster || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-sm">Infrastructure Master</span>
              <span className="text-sm font-medium">{domainInfo.fsmoRoles.infrastructureMaster || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DomainInfoCard;