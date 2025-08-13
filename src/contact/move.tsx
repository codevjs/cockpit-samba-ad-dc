import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
import { useContactMutations } from './hooks/useContactMutations'
import { toast } from 'sonner'

interface MoveContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContactMoved?: () => void;
  contactName?: string;
}

// Common organizational units in Active Directory
const COMMON_OUS = [
  { value: 'CN=Users,DC=domain,DC=local', label: 'Users (Default)' },
  { value: 'OU=Contacts,DC=domain,DC=local', label: 'Contacts' },
  { value: 'OU=External Contacts,DC=domain,DC=local', label: 'External Contacts' },
  { value: 'OU=IT,DC=domain,DC=local', label: 'IT Department' },
  { value: 'OU=HR,DC=domain,DC=local', label: 'HR Department' },
  { value: 'OU=Finance,DC=domain,DC=local', label: 'Finance Department' },
  { value: 'OU=Sales,DC=domain,DC=local', label: 'Sales Department' },
  { value: 'OU=Custom', label: 'Custom OU (specify below)' }
]

export function MoveContactDialog ({
  isOpen,
  onClose,
  onContactMoved,
  contactName: externalContactName
}: MoveContactDialogProps) {
  const [internalContactName, setInternalContactName] = useState('')
  const [selectedOU, setSelectedOU] = useState('CN=Users,DC=domain,DC=local')
  const [customOU, setCustomOU] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const contactName = externalContactName || internalContactName

  const { moveContact } = useContactMutations(
    () => {
      // Success callback
      const targetOU = selectedOU === 'OU=Custom' ? customOU : selectedOU
      toast.success(`Contact "${contactName}" moved to ${targetOU} successfully`)
      resetForm()
      onContactMoved?.()
      onClose()
    },
    (errorMessage: string) => {
      // Error callback
      setError(errorMessage)
    }
  )

  const resetForm = () => {
    setInternalContactName('')
    setSelectedOU('CN=Users,DC=domain,DC=local')
    setCustomOU('')
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
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

  const handleContactNameChange = (value: string) => {
    setInternalContactName(value)
    if (error) {
      setError(null)
    }
  }

  const getTargetOU = () => {
    return selectedOU === 'OU=Custom' ? customOU : selectedOU
  }

  const isFormValid = () => {
    const targetOU = getTargetOU()
    return contactName.trim() && targetOU.trim()
  }

  const handleSubmit = async () => {
    if (!contactName) {
      setError('Contact name is required')
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
      await moveContact(contactName, targetOU)
    } catch (err) {
      // Error is already handled by the mutation hook
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="h-4 w-4" />
            Move Contact to Different OU
          </DialogTitle>
          <DialogDescription>
            Move this contact to a different Organizational Unit (OU). This will change the contact's
            location in the Active Directory hierarchy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Show contact name input only if not provided externally */}
          {!externalContactName && (
            <div className="space-y-2">
              <Label htmlFor="contact-name">Contact Name *</Label>
              <Input
                id="contact-name"
                value={internalContactName}
                onChange={(e) => handleContactNameChange(e.target.value)}
                placeholder="Enter contact name"
              />
              <p className="text-sm text-muted-foreground">
                Enter the name of the contact you want to move
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
              Select the OU where you want to move this contact
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

          {contactName && (
            <Alert>
              <AlertDescription>
                Moving contact <strong>{contactName}</strong> to: <br />
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
            {loading ? 'Moving...' : 'Move Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
