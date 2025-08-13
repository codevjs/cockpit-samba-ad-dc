import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Users, Search, Info } from 'lucide-react'
import { useGroupMembers } from './hooks/useGroups'

interface ListMembersDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  groupName?: string;
  trigger?: React.ReactNode;
}

export const ListMembersDialog: React.FC<ListMembersDialogProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  groupName: externalGroupName,
  trigger
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [internalGroupName, setInternalGroupName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Use external props if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const onClose = externalOnClose || (() => setInternalIsOpen(false))
  const groupName = externalGroupName || internalGroupName

  const { members, loading, error } = useGroupMembers(groupName)

  const filteredMembers = members?.filter(member =>
    member.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleShowDialog = () => {
    setInternalIsOpen(true)
  }

  const handleInputChange = (value: string) => {
    setInternalGroupName(value)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleClose = () => {
    setSearchTerm('')
    onClose()
    if (externalIsOpen === undefined) {
      setInternalIsOpen(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose()
    } else if (externalIsOpen === undefined) {
      setInternalIsOpen(true)
    }
  }

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Members: {groupName}
          </DialogTitle>
          <DialogDescription>
            View all members of the selected group
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <Info className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Error loading group members: {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Members {members && `(${filteredMembers.length}${searchTerm ? ` of ${members.length}` : ''})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading
                ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
                  )
                : filteredMembers.length === 0
                  ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">
                    {searchTerm ? 'No matching members' : 'No members found'}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm
                      ? 'No members match your search criteria.'
                      : 'This group currently has no members.'
                    }
                  </p>
                </div>
                    )
                  : (
                <div className="max-h-64 overflow-y-auto">
                  <div className="space-y-1">
                    {filteredMembers.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 rounded hover:bg-muted/50"
                      >
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{member}</span>
                      </div>
                    ))}
                  </div>
                </div>
                    )}
            </CardContent>
          </Card>

          {members && members.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Group Membership:</strong> This group contains {members.length} member(s).
                Use the search box above to filter the list.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    )
  }

  // Legacy standalone mode without trigger
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
            List Members
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Members: {groupName}
          </DialogTitle>
          <DialogDescription>
            View all members of the selected group
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <Info className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Error loading members: {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1"
            />
          </div>

          <Card className="max-h-96 overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-sm">
                Members ({filteredMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No members match your search' : 'No members found in this group'}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="space-y-1">
                    {filteredMembers.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 rounded hover:bg-muted/50"
                      >
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{member}</span>
                      </div>
                    ))}
                  </div>
                </div>
                    )}
            </CardContent>
          </Card>

          {members && members.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Group Membership:</strong> This group contains {members.length} member(s).
                Use the search box above to filter the list.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ListMembersDialog
