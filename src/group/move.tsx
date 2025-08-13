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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Move } from 'lucide-react'
import { useGroupMutations } from './hooks/useGroupMutations'
import { toast } from 'sonner'

interface MoveGroupDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onGroupMoved?: () => void;
  groupName?: string;
  trigger?: React.ReactNode;
}

// Common organizational units in Active Directory
const COMMON_OUS = [
  { value: 'CN=Users,DC=domain,DC=local', label: 'Users (Default)' },
  { value: 'OU=Groups,DC=domain,DC=local', label: 'Groups' },
  { value: 'OU=Security Groups,DC=domain,DC=local', label: 'Security Groups' },
  { value: 'OU=Distribution Groups,DC=domain,DC=local', label: 'Distribution Groups' },
  { value: 'OU=IT,DC=domain,DC=local', label: 'IT Department' },
  { value: 'OU=HR,DC=domain,DC=local', label: 'HR Department' },
  { value: 'OU=Finance,DC=domain,DC=local', label: 'Finance Department' },
  { value: 'OU=Custom', label: 'Custom OU (specify below)' }
]

export const MoveGroupDialog: React.FC<MoveGroupDialogProps> = ({
  isOpen: externalIsOpen,
  onClose,
  onGroupMoved,
  groupName: externalGroupName,
  trigger
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [internalGroupName, setInternalGroupName] = useState('')
  const [selectedOU, setSelectedOU] = useState('CN=Users,DC=domain,DC=local')
  const [customOU, setCustomOU] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const groupName = externalGroupName || internalGroupName

  const { moveGroup } = useGroupMutations(
    () => {
      // Success callback
      const targetOU = selectedOU === 'OU=Custom' ? customOU : selectedOU
      toast.success(`Group "${groupName}" moved to ${targetOU} successfully`)
      resetForm()
      onGroupMoved?.()
      onClose?.()
    },
    (errorMessage: string) => {
      // Error callback
      setError(errorMessage)
    }
  )

  const handleSubmit = async () => {
    if (!groupName) {
      setError('Group name is required')
      return
    }

    const targetOU = selectedOU === 'OU=Custom' ? customOU : selectedOU

    if (!targetOU.trim()) {
      setError('Target Organizational Unit is required')
      return
    }

    // Basic OU format validation
    if (!targetOU.includes('DC=') || (!targetOU.includes('OU=') && !targetOU.includes('CN='))) {
      setError('Invalid OU format. Expected format: OU=Name,DC=domain,DC=local or CN=Name,DC=domain,DC=local')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await moveGroup(groupName, targetOU)
    } catch (err) {
      // Error is already handled by the mutation hook
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setInternalGroupName('')
    setSelectedOU('CN=Users,DC=domain,DC=local')
    setCustomOU('')
    setError(null)
  }

  const handleOUChange = (value: string) => {
    setSelectedOU(value)
    if (error) {
      setError(null)
    }
  }

  const handleCustomOUChange = (value: string) => {
    setCustomOU(value)
    if (error) {
      setError(null)
    }
  }

  const handleGroupNameChange = (value: string) => {
    setInternalGroupName(value)
    if (error) {
      setError(null)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose?.()
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

  const getTargetOU = () => {
    return selectedOU === 'OU=Custom' ? customOU : selectedOU
  }

  const isFormValid = () => {
    const targetOU = getTargetOU()
    return groupName.trim() && targetOU.trim()
  }

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="h-4 w-4" />
            Move Group to Different OU
          </DialogTitle>
          <DialogDescription>
            Move this group to a different Organizational Unit (OU). This will change the group's
            location in the Active Directory hierarchy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Show group name input only if not provided externally */}
          {!externalGroupName && (
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name *</Label>
              <Input
                id="group-name"
                value={internalGroupName}
                onChange={(e) => handleGroupNameChange(e.target.value)}
                placeholder="Enter group name"
              />
              <p className="text-sm text-muted-foreground">
                Enter the name of the group you want to move
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="target-ou">Target Organizational Unit *</Label>
            <Select value={selectedOU} onValueChange={handleOUChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select target OU" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_OUS.map((option, index) => (
                  <SelectItem key={index} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Select the OU where you want to move this group
            </p>
          </div>

          {selectedOU === 'OU=Custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-ou">Custom OU Path *</Label>
              <Input
                id="custom-ou"
                value={customOU}
                onChange={(e) => handleCustomOUChange(e.target.value)}
                placeholder="OU=YourOU,DC=domain,DC=local"
              />
              <p className="text-sm text-muted-foreground">
                Enter the full Distinguished Name (DN) of the target OU
              </p>
            </div>
          )}

          {groupName && (
            <Alert>
              <AlertDescription>
                Moving group <strong>{groupName}</strong> to: <br />
                <code className="text-sm bg-muted px-1 py-0.5 rounded">{getTargetOU()}</code>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Moving...' : 'Move Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="h-4 w-4" />
            Move Group
          </DialogTitle>
          <DialogDescription>
            Move a group to a different organizational unit
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!externalGroupName && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="groupName" className="text-right">
                Group Name
              </Label>
              <Input
                id="groupName"
                value={internalGroupName}
                onChange={(e) => handleGroupNameChange(e.target.value)}
                className="col-span-3"
                placeholder="Enter group name"
              />
            </div>
          )}

          {externalGroupName && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Group</Label>
              <div className="col-span-3 font-medium">{externalGroupName}</div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetOU" className="text-right">
              Target OU
            </Label>
            <Select value={selectedOU} onValueChange={handleOUChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select organizational unit" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_OUS.map((ou) => (
                  <SelectItem key={ou.value} value={ou.value}>
                    {ou.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOU === 'OU=Custom' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customOU" className="text-right">
                Custom OU
              </Label>
              <Input
                id="customOU"
                value={customOU}
                onChange={(e) => handleCustomOUChange(e.target.value)}
                className="col-span-3"
                placeholder="CN=Groups,DC=domain,DC=local"
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Moving...' : 'Move Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MoveGroupDialog
