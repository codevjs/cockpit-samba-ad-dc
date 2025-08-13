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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Users, AlertTriangle } from 'lucide-react';
import { useGroupMembers } from './hooks/useGroups';
import { useGroupMutations } from './hooks/useGroupMutations';
import { toast } from 'sonner';

interface RemoveMembersDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  groupName?: string;
  trigger?: React.ReactElement;
  onMembersRemoved?: () => void;
}

export const RemoveMembersDialog: React.FC<RemoveMembersDialogProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  groupName: externalGroupName
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [internalGroupName, setInternalGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);

  // Use external props if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onClose = externalOnClose || (() => setInternalIsOpen(false));
  const groupName = externalGroupName || internalGroupName;

  const { members, loading: membersLoading, error: membersError, refresh } = useGroupMembers(groupName);
  const { removeMembers } = useGroupMutations(
    () => {
      toast.success('Members removed successfully');
      setSelectedMembers([]);
      refresh();
    },
    (error) => {
      toast.error(`Failed to remove members: ${error}`);
    }
  );

  const filteredMembers = members?.filter(member =>
    member.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleShowDialog = () => {
    setInternalIsOpen(true);
  };

  const handleInputChange = (value: string) => {
    setInternalGroupName(value);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleMemberToggle = (member: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, member]);
    } else {
      setSelectedMembers(prev => prev.filter(m => m !== member));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(filteredMembers);
    } else {
      setSelectedMembers([]);
    }
  };

  const handleRemoveMembers = async () => {
    if (selectedMembers.length === 0) return;

    setIsRemoving(true);
    try {
      await removeMembers(groupName, selectedMembers);
      handleClose();
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsRemoving(false);
    }
  };

  const handleClose = () => {
    setSelectedMembers([]);
    setSearchTerm('');
    onClose();
  };

  if (!isOpen && !externalIsOpen) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter group name"
            value={internalGroupName}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <Button 
            onClick={handleShowDialog}
            disabled={!internalGroupName.trim()}
          >
            Remove Members
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Remove Members from: {groupName}
          </DialogTitle>
          <DialogDescription>
            Select members to remove from the group
          </DialogDescription>
        </DialogHeader>

        {membersError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Error loading group members: {membersError}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll(selectedMembers.length !== filteredMembers.length)}
            >
              {selectedMembers.length === filteredMembers.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Members ({filteredMembers.length})
                {selectedMembers.length > 0 && ` - ${selectedMembers.length} selected`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No members found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm ? 'No members match your search criteria.' : 'This group has no members.'}
                  </p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredMembers.map((member, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                      <Checkbox
                        checked={selectedMembers.includes(member)}
                        onCheckedChange={(checked) => handleMemberToggle(member, checked as boolean)}
                      />
                      <span className="text-sm flex-1">{member}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedMembers.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Warning:</strong> You are about to remove {selectedMembers.length} member(s) from the group. 
                This action cannot be undone.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleRemoveMembers}
            disabled={selectedMembers.length === 0 || isRemoving}
            variant="destructive"
          >
            {isRemoving ? 'Removing...' : `Remove ${selectedMembers.length} Member(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveMembersDialog;