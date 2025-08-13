import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Server, 
  Database, 
  Globe, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Info
} from 'lucide-react';
import { useDNSServerInfo } from './hooks/useDNS';

interface ServerInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  server?: string | null;
  password?: string;
}

export function ServerInfoDialog({
  isOpen,
  onClose,
  server,
  password,
}: ServerInfoDialogProps) {
  const { serverInfo, loading, error } = useDNSServerInfo(server || '', password, isOpen && !!server);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Running':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Stopped':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Stopped':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            DNS Server Information
          </DialogTitle>
          <DialogDescription>
            View detailed information about the DNS server and its configuration.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && !server && (
          <Alert className="border-orange-200 bg-orange-50">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              No DNS server selected. Please select a server to view its information.
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && serverInfo && (
          <div className="space-y-6">
            {/* Server Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Server Overview
                </CardTitle>
                <CardDescription>
                  Basic information about the DNS server
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Server Name</p>
                    <p className="text-lg font-semibold">{serverInfo.serverName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(serverInfo.status)}
                      <Badge className={getStatusColor(serverInfo.status)}>
                        {serverInfo.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Version</p>
                    <p className="text-lg">{serverInfo.version}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Zones</p>
                    <p className="text-lg font-semibold">{serverInfo.zones.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DNS Zones */}
            {serverInfo.zones.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    DNS Zones
                  </CardTitle>
                  <CardDescription>
                    Zones configured on this DNS server
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {serverInfo.zones.map((zone, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Database className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium">{zone}</p>
                            <p className="text-sm text-muted-foreground">DNS Zone</p>
                          </div>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Server Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Server Configuration
                </CardTitle>
                <CardDescription>
                  Technical details and configuration information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Service Status</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(serverInfo.status)}
                        <span className="text-sm">
                          DNS service is {serverInfo.status.toLowerCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Version Information</p>
                      <p className="text-sm">
                        DNS server version: {serverInfo.version}
                      </p>
                    </div>
                    
                    {serverInfo.zones.length === 0 && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Zone Configuration</p>
                        <p className="text-sm text-muted-foreground">
                          No DNS zones configured on this server
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raw Output (for debugging) */}
            {serverInfo.rawOutput && serverInfo.rawOutput.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Raw Server Output</CardTitle>
                  <CardDescription>
                    Technical output from the DNS server query
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-lg">
                    <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
                      {serverInfo.rawOutput.join('\n')}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}