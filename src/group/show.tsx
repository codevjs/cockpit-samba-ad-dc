import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Info } from 'lucide-react';
import { useGroupDetails, useGroupMembers } from './hooks/useGroups';

interface GroupDetailsDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  groupName?: string;
  trigger?: React.ReactElement;
}

export const GroupDetailsDialog: React.FC<GroupDetailsDialogProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  groupName: externalGroupName
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [internalGroupName, setInternalGroupName] = useState('');

  // Use external props if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));
  const groupName = externalGroupName || internalGroupName;

  const { group, loading: groupLoading, error: groupError } = useGroupDetails(groupName);
  const { members, loading: membersLoading, error: membersError } = useGroupMembers(groupName);

  const handleShowGroup = () => {
    setInternalIsOpen(true);
  };

  const handleInputChange = (_event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setInternalGroupName(value);
  };

  if (!isOpen && !externalIsOpen) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter group name"
            value={internalGroupName}
            onChange={(e) => handleInputChange(e, e.target.value)}
          />
          <Button 
            onClick={handleShowGroup}
            disabled={!internalGroupName.trim()}
          >
            Show Group
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Details: {groupName}
          </DialogTitle>
          <DialogDescription>
            View group information and manage members
          </DialogDescription>
        </DialogHeader>

        {groupError && (
          <Alert className="border-red-200 bg-red-50">
            <Info className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Error loading group details: {groupError}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Group Details</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Group Information</CardTitle>
              </CardHeader>
              <CardContent>
                {groupLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : group ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                        <dd className="text-sm mt-1">{group.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Display Name</dt>
                        <dd className="text-sm mt-1">{group.displayName || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                        <dd className="text-sm mt-1">{group.description || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Group Type</dt>
                        <dd className="text-sm mt-1">{group.groupType || 'N/A'}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-sm font-medium text-muted-foreground">Distinguished Name</dt>
                        <dd className="text-sm mt-1 font-mono break-all">{group.distinguishedName}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">SID</dt>
                        <dd className="text-sm mt-1 font-mono">{group.sid || 'N/A'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Member Count</dt>
                        <dd className="text-sm mt-1">{group.memberCount || 0}</dd>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">Group not found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      The specified group could not be located.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Group Members</CardTitle>
              </CardHeader>
              <CardContent>
                {membersError && (
                  <Alert className="border-red-200 bg-red-50 mb-4">
                    <Info className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Error loading members: {membersError}
                    </AlertDescription>
                  </Alert>
                )}

                {membersLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : members && members.length > 0 ? (
                  <div className="space-y-2">
                    {members.map((member, index) => (
                      <div key={index} className="flex items-center p-2 bg-muted/50 rounded">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{member}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No members</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This group currently has no members.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupDetailsDialog;