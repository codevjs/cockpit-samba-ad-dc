import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  FolderOpen, 
  Settings, 
  Calendar, 
  Hash,
  FileText,
  Link
} from 'lucide-react';
import type { SambaGPO } from '@/types/samba';

interface ShowGPODialogProps {
  isOpen: boolean;
  onClose: () => void;
  gpo: SambaGPO | null;
}

export function ShowGPODialog({
  isOpen,
  onClose,
  gpo,
}: ShowGPODialogProps) {
  if (!gpo) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Enabled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Disabled':
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
            <FolderOpen className="h-5 w-5" />
            GPO Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about the Group Policy Object.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Core GPO properties and identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold">{gpo.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(gpo.status)}>
                    {gpo.status}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                <p className="text-lg">{gpo.displayName}</p>
              </div>
              
              {gpo.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm">{gpo.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Technical Details
              </CardTitle>
              <CardDescription>
                Technical identifiers and versioning information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">GUID</p>
                <p className="font-mono text-sm bg-muted p-2 rounded">{gpo.guid}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Version</p>
                  <p className="text-lg font-semibold">{gpo.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Linked OUs</p>
                  <p className="text-lg font-semibold">{gpo.linkedOUs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timestamps
              </CardTitle>
              <CardDescription>
                Creation and modification dates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">{gpo.createdAt.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Modified</p>
                  <p className="text-sm">{gpo.modifiedAt.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked OUs */}
          {gpo.linkedOUs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Linked Containers
                </CardTitle>
                <CardDescription>
                  Organizational units and containers where this GPO is applied
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gpo.linkedOUs.map((ou, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <Link className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">{ou}</p>
                        <p className="text-sm text-muted-foreground">Organizational Unit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Management Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Management Information
              </CardTitle>
              <CardDescription>
                Additional details for GPO management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Policy Settings</p>
                  <p className="text-sm text-muted-foreground">
                    Use Group Policy Management Console (GPMC) to view and edit policy settings.
                  </p>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Security Filtering</p>
                  <p className="text-sm text-muted-foreground">
                    Configure security filtering through GPMC to control which users and computers receive this policy.
                  </p>
                </div>
                
                {gpo.linkedOUs.length === 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-medium text-orange-800 mb-1">No Links</p>
                    <p className="text-sm text-orange-700">
                      This GPO is not linked to any containers and will not apply to any users or computers.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}