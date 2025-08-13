import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Plus, 
  Trash2,
  Search,
  Settings,
  Database,
  Server,
  ArrowLeft,
  Info
} from 'lucide-react';
import { BackButton } from '../common';
import { useDNSZones, useDNSServerInfo } from './hooks/useDNS';
import { CreateRecordDialog } from './create-record';
import { DeleteRecordDialog } from './delete-record';
import { CreateZoneDialog } from './create-zone';
import { DeleteZoneDialog } from './delete-zone';
import { ServerInfoDialog } from './server-info';
import { CleanupDialog } from './cleanup';
import { toast } from 'sonner';

export default function DNSManagement() {
  const [serverName, setServerName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  
  // Dialog states
  const [createRecordDialogOpen, setCreateRecordDialogOpen] = useState(false);
  const [deleteRecordDialogOpen, setDeleteRecordDialogOpen] = useState(false);
  const [createZoneDialogOpen, setCreateZoneDialogOpen] = useState(false);
  const [deleteZoneDialogOpen, setDeleteZoneDialogOpen] = useState(false);
  const [serverInfoDialogOpen, setServerInfoDialogOpen] = useState(false);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);

  const { zones, loading: zonesLoading, refresh: refreshZones } = useDNSZones(selectedServer, password);
  const { serverInfo, loading: serverLoading, refresh: refreshServerInfo } = useDNSServerInfo(selectedServer, password);

  const handleOperationSuccess = () => {
    refreshZones();
    refreshServerInfo();
  };

  const handleConnectServer = () => {
    if (serverName.trim()) {
      setSelectedServer(serverName.trim());
    } else {
      toast.error('Please enter a server name');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DNS Management</h1>
          <p className="text-muted-foreground">
            Manage DNS zones and records for Active Directory
          </p>
        </div>
      </div>

      {/* Server Connection */}
      <Card>
        <CardHeader>
          <CardTitle>DNS Server Connection</CardTitle>
          <CardDescription>
            Connect to a DNS server to manage zones and records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Server Name</label>
              <Input
                placeholder="dns.domain.com"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConnectServer()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Password (Optional)</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleConnectServer} className="w-full">
                Connect
              </Button>
            </div>
          </div>
          {selectedServer && (
            <div className="mt-4">
              <Alert>
                <Server className="h-4 w-4" />
                <AlertDescription>
                  Connected to: <strong>{selectedServer}</strong>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {selectedServer && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Server</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold truncate">{selectedServer}</div>
              <p className="text-xs text-muted-foreground">
                DNS server
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Zones</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{zones.length}</div>
              <p className="text-xs text-muted-foreground">
                DNS zones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{serverInfo?.status || 'Unknown'}</div>
              <p className="text-xs text-muted-foreground">
                Server status
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Version</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{serverInfo?.version || 'Unknown'}</div>
              <p className="text-xs text-muted-foreground">
                DNS version
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="operations" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Operations
            </TabsTrigger>
            {selectedServer && (
              <TabsTrigger value="zones" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                DNS Zones
              </TabsTrigger>
            )}
          </TabsList>

          {selectedServer && (
            <div className="flex items-center gap-2">
              <Button onClick={refreshZones} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="operations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Record
                </CardTitle>
                <CardDescription>
                  Add a new DNS record to a zone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setCreateRecordDialogOpen(true)}
                  className="w-full"
                  disabled={!selectedServer}
                >
                  Create Record
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Delete Record
                </CardTitle>
                <CardDescription>
                  Remove a DNS record from a zone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setDeleteRecordDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                  disabled={!selectedServer}
                >
                  Delete Record
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Zone
                </CardTitle>
                <CardDescription>
                  Create a new DNS zone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setCreateZoneDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                  disabled={!selectedServer}
                >
                  Create Zone
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Delete Zone
                </CardTitle>
                <CardDescription>
                  Remove an entire DNS zone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setDeleteZoneDialogOpen(true)}
                  className="w-full"
                  variant="destructive"
                  disabled={!selectedServer}
                >
                  Delete Zone
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Server Info
                </CardTitle>
                <CardDescription>
                  View DNS server information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setServerInfoDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                  disabled={!selectedServer}
                >
                  Server Info
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cleanup
                </CardTitle>
                <CardDescription>
                  Clean up stale DNS records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setCleanupDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                  disabled={!selectedServer}
                >
                  Cleanup DNS
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {selectedServer && (
          <TabsContent value="zones">
            <Card>
              <CardHeader>
                <CardTitle>DNS Zones</CardTitle>
                <CardDescription>
                  DNS zones configured on {selectedServer}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {zonesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-12 bg-muted rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : zones.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No DNS Zones</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No DNS zones found on this server
                    </p>
                    <Button onClick={() => setCreateZoneDialogOpen(true)} className="mt-4">
                      Create Zone
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {zones.map((zone, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{zone}</p>
                            <p className="text-sm text-muted-foreground">DNS Zone</p>
                          </div>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">DNS Management</p>
            <p className="text-sm">
              This module provides tools for managing DNS zones and records on 
              Samba AD DC servers. DNS is critical for Active Directory functionality 
              and should be managed carefully.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Dialogs */}
      <CreateRecordDialog
        isOpen={createRecordDialogOpen}
        onClose={() => setCreateRecordDialogOpen(false)}
        onRecordCreated={handleOperationSuccess}
        defaultServer={selectedServer}
        defaultPassword={password}
      />

      <DeleteRecordDialog
        isOpen={deleteRecordDialogOpen}
        onClose={() => setDeleteRecordDialogOpen(false)}
        onRecordDeleted={handleOperationSuccess}
        defaultServer={selectedServer}
        defaultPassword={password}
      />

      <CreateZoneDialog
        isOpen={createZoneDialogOpen}
        onClose={() => setCreateZoneDialogOpen(false)}
        onZoneCreated={handleOperationSuccess}
        defaultServer={selectedServer}
        defaultPassword={password}
      />

      <DeleteZoneDialog
        isOpen={deleteZoneDialogOpen}
        onClose={() => setDeleteZoneDialogOpen(false)}
        onZoneDeleted={handleOperationSuccess}
        defaultServer={selectedServer}
        defaultPassword={password}
      />

      <ServerInfoDialog
        isOpen={serverInfoDialogOpen}
        onClose={() => setServerInfoDialogOpen(false)}
        server={selectedServer}
        password={password}
      />

      <CleanupDialog
        isOpen={cleanupDialogOpen}
        onClose={() => setCleanupDialogOpen(false)}
        onCleanupCompleted={handleOperationSuccess}
        defaultServer={selectedServer}
        defaultPassword={password}
      />
    </div>
  );
}