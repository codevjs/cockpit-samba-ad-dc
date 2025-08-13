import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Computer, 
  UserCheck, 
  Mail,
  Loader2
} from 'lucide-react';
import { useOUObjects } from './hooks/useOU';

interface ListObjectsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ouDN: string | null;
}

export function ListObjectsDialog({ isOpen, onClose, ouDN }: ListObjectsDialogProps) {
  const { objects, loading, error } = useOUObjects(ouDN, isOpen && !!ouDN);

  const getObjectIcon = (type: string) => {
    switch (type) {
      case 'User':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'Computer':
        return <Computer className="h-4 w-4 text-green-600" />;
      case 'Group':
        return <UserCheck className="h-4 w-4 text-purple-600" />;
      case 'Contact':
        return <Mail className="h-4 w-4 text-orange-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getObjectTypeColor = (type: string) => {
    switch (type) {
      case 'User':
        return 'bg-blue-100 text-blue-800';
      case 'Computer':
        return 'bg-green-100 text-green-800';
      case 'Group':
        return 'bg-purple-100 text-purple-800';
      case 'Contact':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group objects by type
  const groupedObjects = objects.reduce((acc, obj) => {
    if (!acc[obj.type]) {
      acc[obj.type] = [];
    }
    acc[obj.type].push(obj);
    return acc;
  }, {} as Record<string, typeof objects>);

  if (!ouDN) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>OU Objects</DialogTitle>
          <DialogDescription>
            Objects contained in this organizational unit
          </DialogDescription>
          <div className="text-sm text-muted-foreground">
            <code className="bg-muted px-2 py-1 rounded text-xs">
              {ouDN}
            </code>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading objects...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-destructive text-sm">
                Error loading objects: {error}
              </div>
            </div>
          ) : objects.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No Objects Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This organizational unit contains no objects
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(groupedObjects).map(([type, items]) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {items.length} {type}{items.length !== 1 ? 's' : ''}
                  </Badge>
                ))}
              </div>

              {/* Objects by type */}
              {Object.entries(groupedObjects).map(([type, items]) => (
                <div key={type}>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    {getObjectIcon(type)}
                    {type}s ({items.length})
                  </h4>
                  <div className="space-y-2">
                    {items.map((object) => (
                      <Card key={object.distinguishedName} className="border-l-4 border-l-border">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getObjectIcon(object.type)}
                              <div>
                                <p className="font-medium text-sm">{object.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[400px]">
                                  {object.distinguishedName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getObjectTypeColor(object.type)}`}
                              >
                                {object.type}
                              </Badge>
                              {object.enabled !== undefined && (
                                <Badge 
                                  variant={object.enabled ? "default" : "destructive"} 
                                  className="text-xs"
                                >
                                  {object.enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}