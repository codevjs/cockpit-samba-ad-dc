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
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { useGroupMutations } from './hooks/useGroupMutations'
import { toast } from 'sonner'

interface DeleteGroupDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onGroupDeleted?: () => void;
  groupName?: string;
  trigger?: React.ReactNode;
}

export const DeleteGroupDialog: React.FC<DeleteGroupDialogProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onGroupDeleted,
  groupName: externalGroupName,
  trigger
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [internalGroupName, setInternalGroupName] = useState('')
  const [confirmationText, setConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const onClose = externalOnClose || (() => setInternalIsOpen(false))
  const groupName = externalGroupName || internalGroupName

  const { deleteGroup } = useGroupMutations(
    () => {
      toast.success('Group deleted successfully')
      onGroupDeleted?.()
    },
    (error) => {
      toast.error(`Failed to delete group: ${error}`)
    }
  )

  const handleShowDialog = () => {
    setInternalIsOpen(true)
  }

  const handleInputChange = (value: string) => {
    setInternalGroupName(value)
  }

  const handleConfirmationChange = (value: string) => {
    setConfirmationText(value)
  }

  const handleDeleteGroup = async () => {
    if (!groupName || confirmationText !== groupName) return

    setIsDeleting(true)
    try {
      await deleteGroup(groupName)
      handleClose()
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setConfirmationText('')
    onClose()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose()
    } else if (externalIsOpen === undefined) {
      setInternalIsOpen(true)
    }
  }

  const isConfirmationValid = confirmationText === groupName

  // If trigger prop is provided, use Dialog with DialogTrigger
  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Group: {groupName}
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the group and remove all its members.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Warning:</strong> Deleting this group will:
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Permanently remove the group from Active Directory</li>
              <li>Remove all members from the group</li>
              <li>Remove any permissions assigned to this group</li>
              <li>This action cannot be undone</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type the group name "{groupName}" to confirm deletion
            </Label>
            <Input
              id="confirmation"
              placeholder={`Type "${groupName}" to confirm`}
              value={confirmationText}
              onChange={(e) => handleConfirmationChange(e.target.value)}
              className={confirmationText && !isConfirmationValid ? 'border-red-500' : ''}
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-sm text-red-500">
                Confirmation text does not match the group name
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteGroup}
            disabled={!isConfirmationValid || isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Group'}
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
            variant="destructive"
          >
            Delete Group
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Group: {groupName}
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the group and remove all its members.
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Warning:</strong> Deleting this group will:
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Permanently remove the group from Active Directory</li>
              <li>Remove all members from the group</li>
              <li>Remove any permissions assigned to this group</li>
              <li>This action cannot be undone</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type the group name "{groupName}" to confirm deletion
            </Label>
            <Input
              id="confirmation"
              placeholder={`Type "${groupName}" to confirm`}
              value={confirmationText}
              onChange={(e) => handleConfirmationChange(e.target.value)}
              className={confirmationText && !isConfirmationValid ? 'border-red-500' : ''}
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-sm text-red-500">
                Confirmation text does not match the group name
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteGroup}
            disabled={!isConfirmationValid || isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteGroupDialog
